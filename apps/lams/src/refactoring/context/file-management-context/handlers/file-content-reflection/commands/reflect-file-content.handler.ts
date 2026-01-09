import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReflectFileContentCommand } from './reflect-file-content.command';
import { IReflectFileContentResponse } from '../../../interfaces';
import { DomainFileService } from '../../../../../domain/file/file.service';
import { DomainFileContentReflectionHistoryService } from '../../../../../domain/file-content-reflection-history/file-content-reflection-history.service';
import { DomainEventInfoService } from '../../../../../domain/event-info/event-info.service';
import { DomainUsedAttendanceService } from '../../../../../domain/used-attendance/used-attendance.service';
import {
    ReflectionStatus,
    ReflectionType,
} from '../../../../../domain/file-content-reflection-history/file-content-reflection-history.types';
import { EventInfo } from '../../../../../domain/event-info/event-info.entity';
import { UsedAttendance } from '../../../../../domain/used-attendance/used-attendance.entity';
import { In } from 'typeorm';
import { DomainAttendanceTypeService } from '../../../../../domain/attendance-type/attendance-type.service';
import { Employee } from '@libs/modules/employee/employee.entity';
import { DomainEmployeeService } from '@libs/modules/employee/employee.service';

/**
 * 파일 내용 반영 핸들러
 *
 * 1. 파일엔티티에 저장된 파일내용정보를 가져온다
 * 2. 적용하고자 하는 직원들을 선택한다
 * 3. 파일내용정보에서 선택된 직원들의 정보만 저장한다 (event-info entity, used-attendance entity)
 * 4. 파일내용 반영에 대한 이력을 저장한다 (file-content-reflection-history entity)
 */
@CommandHandler(ReflectFileContentCommand)
export class ReflectFileContentHandler implements ICommandHandler<
    ReflectFileContentCommand,
    IReflectFileContentResponse
> {
    private readonly logger = new Logger(ReflectFileContentHandler.name);

    constructor(
        private readonly fileService: DomainFileService,
        private readonly fileContentReflectionHistoryService: DomainFileContentReflectionHistoryService,
        private readonly eventInfoService: DomainEventInfoService,
        private readonly usedAttendanceService: DomainUsedAttendanceService,
        private readonly employeeService: DomainEmployeeService,
        private readonly attendanceTypeService: DomainAttendanceTypeService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: ReflectFileContentCommand): Promise<IReflectFileContentResponse> {
        const { fileId, employeeIds, year, month, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`파일 내용 반영 시작: fileId=${fileId}, 직원 수=${employeeIds.length}`);

                // 1. 파일 엔티티 조회
                const file = await this.fileService.ID로조회한다(fileId);
                if (!file) {
                    throw new NotFoundException(`파일을 찾을 수 없습니다. (fileId: ${fileId})`);
                }

                // 2. 파일 엔티티의 data 컬럼에서 데이터 가져오기
                if (!file.data || !file.data.excelData) {
                    throw new BadRequestException(
                        '파일 엔티티에 저장된 데이터가 없습니다. 파일을 먼저 업로드하고 검증해야 합니다.',
                    );
                }

                const excelData = file.data.excelData as Record<string, Record<string, any>[]>;
                const fileType = file.data.fileType as ReflectionType;

                if (!excelData || typeof excelData !== 'object' || Object.keys(excelData).length === 0) {
                    throw new BadRequestException('파일에 데이터가 없습니다.');
                }

                const totalRows = Object.values(excelData).reduce((sum, rows) => sum + rows.length, 0);
                this.logger.log(
                    `파일 데이터 읽기 완료: ${Object.keys(excelData).length}명의 직원, 총 ${totalRows}행, 파일 타입: ${fileType}`,
                );

                // 3. 직원 정보 조회 (employeeIds로 조회하여 employeeNumber 매핑)
                const employees = await manager.find(Employee, {
                    where: { id: In(employeeIds) },
                });
                const employeeMap = new Map<string, Employee>(employees.map((emp) => [emp.employeeNumber, emp]));
                const employeeIdMap = new Map<string, string>(employees.map((emp) => [emp.employeeNumber, emp.id]));

                this.logger.log(`직원 정보 조회 완료: ${employees.length}명`);

                // 4. 근태 유형 조회 (근태 사용 내역인 경우)
                let attendanceTypeMap = new Map<string, string>();
                if (fileType === ReflectionType.ATTENDANCE_DATA) {
                    const attendanceTypes = await this.attendanceTypeService.목록조회한다();
                    attendanceTypeMap = new Map<string, string>(attendanceTypes.map((at) => [at.title, at.id]));
                    this.logger.log(`근태 유형 조회 완료: ${attendanceTypes.length}개`);
                }

                // 5. 데이터 가공 및 필터링 (선택된 직원만)
                const processedData = await this.processFileContent(
                    excelData,
                    employeeIds,
                    employeeMap,
                    employeeIdMap,
                    attendanceTypeMap,
                    year,
                    month,
                    fileType,
                );

                this.logger.log(
                    `데이터 가공 완료: eventInfo ${processedData.eventInfos.length}건, usedAttendance ${processedData.usedAttendances.length}건`,
                );

                // 6. 동일 연월의 기존 데이터 하드 삭제 (선택된 직원만)
                await this.해당연월기존데이터를삭제한다(
                    fileType,
                    year,
                    month,
                    employeeIds,
                    employeeMap,
                    employeeIdMap,
                    manager,
                );

                // 7. 이벤트 정보 저장
                let eventInfoCount = 0;
                if (processedData.eventInfos.length > 0) {
                    const EVENT_BATCH_SIZE = 10000;
                    for (let i = 0; i < processedData.eventInfos.length; i += EVENT_BATCH_SIZE) {
                        const batch = processedData.eventInfos.slice(i, i + EVENT_BATCH_SIZE);
                        await manager.createQueryBuilder().insert().into(EventInfo).values(batch).execute();
                    }
                    eventInfoCount = processedData.eventInfos.length;
                }

                // 8. 근태 사용 내역 저장
                let usedAttendanceCount = 0;
                if (processedData.usedAttendances.length > 0) {
                    const ATTENDANCE_BATCH_SIZE = 1000;
                    for (let i = 0; i < processedData.usedAttendances.length; i += ATTENDANCE_BATCH_SIZE) {
                        const batch = processedData.usedAttendances.slice(i, i + ATTENDANCE_BATCH_SIZE);
                        await manager.createQueryBuilder().insert().into(UsedAttendance).values(batch).execute();
                    }
                    usedAttendanceCount = processedData.usedAttendances.length;
                }

                // 9. 해당 연월의 모든 직원 데이터 조회 (id 제외)
                const reflectionData = await this.해당연월데이터를조회한다(fileType, year, month, manager);

                // 10. 파일 내용 반영 이력 저장
                const reflectionHistory = await this.fileContentReflectionHistoryService.생성한다(
                    {
                        fileId,
                        type: fileType,
                        status: ReflectionStatus.COMPLETED,
                        data: reflectionData,
                    },
                    manager,
                );

                this.logger.log(`✅ 파일 내용 반영 완료: reflectionHistoryId=${reflectionHistory.id}`);

                return {
                    fileId,
                    reflectionHistoryId: reflectionHistory.id,
                };
            } catch (error) {
                this.logger.error(`파일 내용 반영 실패: ${error.message}`, error.stack);

                // 반영 실패 이력 저장
                try {
                    const file = await this.fileService.ID로조회한다(fileId);
                    const fileType = file?.data?.fileType || ReflectionType.OTHER;

                    await this.fileContentReflectionHistoryService.생성한다(
                        {
                            fileId,
                            type: fileType as ReflectionType,
                            status: ReflectionStatus.FAILED,
                            data: {
                                error: error.message,
                                employeeIds,
                                year,
                                month,
                            },
                        },
                        manager,
                    );
                } catch (historyError) {
                    this.logger.error(`반영 실패 이력 저장 실패: ${historyError.message}`);
                }

                if (error instanceof NotFoundException || error instanceof BadRequestException) {
                    throw error;
                }
                throw new BadRequestException(`파일 내용 반영 중 오류가 발생했습니다: ${error.message}`);
            }
        });
    }

    /**
     * 파일 내용 가공 및 필터링
     *
     * 파일 엔티티의 data 컬럼에서 가져온 excelData를 기반으로
     * 선택된 직원들의 정보만 필터링하여 event-info와 used-attendance로 변환합니다.
     *
     * excelData는 직원별로 그룹화된 구조: Record<string, Record<string, any>[]>
     * - 키: employeeNumber (직원번호)
     * - 값: 해당 직원의 데이터 배열
     */
    private async processFileContent(
        excelData: Record<string, Record<string, any>[]>,
        employeeIds: string[],
        employeeMap: Map<string, Employee>,
        employeeIdMap: Map<string, string>,
        attendanceTypeMap: Map<string, string>,
        year: string,
        month: string,
        fileType: ReflectionType,
    ): Promise<{
        eventInfos: Partial<EventInfo>[];
        usedAttendances: Partial<UsedAttendance>[];
        processedEmployeeIds: string[];
    }> {
        const eventInfos: Partial<EventInfo>[] = [];
        const usedAttendances: Partial<UsedAttendance>[] = [];
        const processedEmployeeIds: string[] = [];

        if (fileType === ReflectionType.EVENT_HISTORY) {
            // 출입 이벤트 데이터 처리
            // excelData는 직원별로 그룹화되어 있음: { employeeNumber: [row1, row2, ...] }
            Object.entries(excelData).forEach(([employeeNumber, rows]) => {
                // employeeMap에 있는 직원만 처리 (employeeIds에 해당하는 직원)
                if (!employeeMap.has(employeeNumber)) {
                    return;
                }

                rows.forEach((row) => {
                    // year, month 필터링
                    const eventTime = row.eventTime || row.event_time;
                    if (!eventTime) {
                        return;
                    }

                    // eventTime에서 날짜 추출 (형식에 따라 다를 수 있음)
                    // 예: "2024-01-15 14:30:00" 또는 "20240115143000"
                    const dateMatch = eventTime.match(/(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/);
                    if (!dateMatch) {
                        this.logger.warn(`이벤트 시간 형식이 올바르지 않습니다: ${eventTime}`);
                        return;
                    }

                    const eventYear = dateMatch[1];
                    const eventMonth = dateMatch[2];
                    const eventDay = dateMatch[3];

                    // year, month 필터링
                    if (eventYear !== year || eventMonth !== month) {
                        return;
                    }

                    // EventInfo 엔티티 형식으로 변환
                    const yyyymmdd = `${eventYear}${eventMonth}${eventDay}`;
                    const timeMatch = eventTime.match(/(\d{2}):?(\d{2}):?(\d{2})/);
                    const hhmmss = timeMatch ? `${timeMatch[1]}${timeMatch[2]}${timeMatch[3]}` : '000000';

                    eventInfos.push({
                        employee_name: row.name || '',
                        employee_number: employeeNumber || null,
                        event_time: eventTime,
                        yyyymmdd,
                        hhmmss,
                    });

                    if (!processedEmployeeIds.includes(employeeNumber)) {
                        processedEmployeeIds.push(employeeNumber);
                    }
                });
            });
        } else if (fileType === ReflectionType.ATTENDANCE_DATA) {
            // 근태 사용 내역 데이터 처리
            // excelData는 직원별로 그룹화되어 있음: { employeeNumber: [row1, row2, ...] }
            Object.entries(excelData).forEach(([employeeNumber, rows]) => {
                // employeeMap에 있는 직원만 처리 (employeeIds에 해당하는 직원)
                const employeeId = employeeIdMap.get(employeeNumber);
                if (!employeeId) {
                    return;
                }

                rows.forEach((row) => {
                    // period에서 날짜 추출 (예: "2024-01-15", "20240115", "2025-11-24 ~ 2025-11-28")
                    const period = row.period || '';

                    // 범위 형식인지 확인 (예: "2025-11-24 ~ 2025-11-28")
                    const rangeMatch = period.match(
                        /(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})\s*[~-]\s*(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/,
                    );

                    const dateList: string[] = [];

                    if (rangeMatch) {
                        // 범위 형식: 시작일부터 종료일까지 모든 날짜 생성
                        const startYear = parseInt(rangeMatch[1]);
                        const startMonth = parseInt(rangeMatch[2]);
                        const startDay = parseInt(rangeMatch[3]);
                        const endYear = parseInt(rangeMatch[4]);
                        const endMonth = parseInt(rangeMatch[5]);
                        const endDay = parseInt(rangeMatch[6]);

                        const startDate = new Date(startYear, startMonth - 1, startDay);
                        const endDate = new Date(endYear, endMonth - 1, endDay);

                        // 시작일부터 종료일까지 모든 날짜 생성
                        const currentDate = new Date(startDate);
                        while (currentDate <= endDate) {
                            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                            dateList.push(dateStr);
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                    } else {
                        // 단일 날짜 형식
                        const dateMatch = period.match(/(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/);
                        if (!dateMatch) {
                            this.logger.warn(`기간 형식이 올바르지 않습니다: ${period}`);
                            return;
                        }

                        const dateYear = dateMatch[1];
                        const dateMonth = dateMatch[2];
                        const dateDay = dateMatch[3];

                        // YYYY-MM-DD 형식으로 변환
                        const dateStr = `${dateYear}-${dateMonth}-${dateDay}`;
                        dateList.push(dateStr);
                    }

                    // 근태유형명으로 attendance_type_id 조회
                    const attendanceTypeName = row.type || '';
                    const attendanceTypeId = attendanceTypeMap.get(attendanceTypeName);
                    if (!attendanceTypeId) {
                        this.logger.warn(
                            `근태 유형을 찾을 수 없습니다: ${attendanceTypeName} (직원: ${employeeNumber})`,
                        );
                        return;
                    }

                    // 각 날짜마다 UsedAttendance 엔티티 생성
                    dateList.forEach((dateStr) => {
                        // 날짜에서 연도와 월 추출
                        const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                        if (!dateMatch) {
                            return;
                        }

                        const dateYear = dateMatch[1];
                        const dateMonth = dateMatch[2];

                        // year, month 필터링
                        if (dateYear !== year || dateMonth !== month) {
                            return;
                        }

                        // UsedAttendance 엔티티 형식으로 변환 (YYYY-MM-DD 형식 유지)
                        usedAttendances.push({
                            used_at: dateStr, // YYYY-MM-DD 형식
                            employee_id: employeeId,
                            attendance_type_id: attendanceTypeId,
                        });
                    });

                    if (!processedEmployeeIds.includes(employeeNumber)) {
                        processedEmployeeIds.push(employeeNumber);
                    }
                });
            });
        }

        this.logger.log(
            `데이터 처리 완료: eventInfo ${eventInfos.length}건, usedAttendance ${usedAttendances.length}건, 처리된 직원 ${processedEmployeeIds.length}명`,
        );

        return {
            eventInfos,
            usedAttendances,
            processedEmployeeIds,
        };
    }

    /**
     * 해당 연월의 기존 데이터를 하드 삭제한다 (선택된 직원만)
     */
    private async 해당연월기존데이터를삭제한다(
        fileType: ReflectionType,
        year: string,
        month: string,
        employeeIds: string[],
        employeeMap: Map<string, Employee>,
        employeeIdMap: Map<string, string>,
        manager: any,
    ): Promise<void> {
        // 날짜 범위 계산
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = `${year}${month.padStart(2, '0')}01`;
        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        const endDate = `${year}${month.padStart(2, '0')}${lastDay.toString().padStart(2, '0')}`;

        if (fileType === ReflectionType.EVENT_HISTORY) {
            // 선택된 직원들의 employeeNumber 목록
            const employeeNumbers = Array.from(employeeMap.keys());

            if (employeeNumbers.length === 0) {
                return;
            }

            // 해당 연월의 선택된 직원들의 EventInfo 하드 삭제
            const deleteResult = await manager
                .createQueryBuilder()
                .delete()
                .from(EventInfo)
                .where('yyyymmdd >= :startDate', { startDate })
                .andWhere('yyyymmdd <= :endDate', { endDate })
                .andWhere('employee_number IN (:...employeeNumbers)', { employeeNumbers })
                .execute();

            this.logger.log(
                `기존 EventInfo 하드 삭제 완료: ${deleteResult.affected || 0}건 (연월: ${year}-${month}, 직원 수: ${employeeNumbers.length}명)`,
            );
        } else if (fileType === ReflectionType.ATTENDANCE_DATA) {
            // 선택된 직원들의 employee_id 목록
            const selectedEmployeeIds = Array.from(employeeIdMap.values());

            if (selectedEmployeeIds.length === 0) {
                return;
            }

            // 해당 연월의 선택된 직원들의 UsedAttendance 하드 삭제
            const startDateStr = `${year}-${month.padStart(2, '0')}-01`;
            const endDateStr = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

            const deleteResult = await manager
                .createQueryBuilder()
                .delete()
                .from(UsedAttendance)
                .where('used_at >= :startDate', { startDate: startDateStr })
                .andWhere('used_at <= :endDate', { endDate: endDateStr })
                .andWhere('employee_id IN (:...employeeIds)', { employeeIds: selectedEmployeeIds })
                .execute();

            this.logger.log(
                `기존 UsedAttendance 하드 삭제 완료: ${deleteResult.affected || 0}건 (연월: ${year}-${month}, 직원 수: ${selectedEmployeeIds.length}명)`,
            );
        }
    }

    /**
     * 해당 연월의 모든 직원 데이터를 조회한다 (id 제외)
     */
    private async 해당연월데이터를조회한다(
        fileType: ReflectionType,
        year: string,
        month: string,
        manager: any,
    ): Promise<Record<string, any>> {
        // 날짜 범위 계산 (YYYYMMDD 형식)
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = `${year}${month.padStart(2, '0')}01`;
        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        const endDate = `${year}${month.padStart(2, '0')}${lastDay.toString().padStart(2, '0')}`;

        if (fileType === ReflectionType.EVENT_HISTORY) {
            // 이벤트 정보 조회 (모든 직원)
            const eventInfos = await manager
                .createQueryBuilder(EventInfo, 'ei')
                .where('ei.yyyymmdd >= :startDate', { startDate })
                .andWhere('ei.yyyymmdd <= :endDate', { endDate })
                .andWhere('ei.deleted_at IS NULL')
                .orderBy('ei.yyyymmdd', 'ASC')
                .addOrderBy('ei.hhmmss', 'ASC')
                .getMany();

            // id를 제외한 데이터만 추출
            const eventData = eventInfos.map((event) => ({
                employee_name: event.employee_name,
                employee_number: event.employee_number,
                event_time: event.event_time,
                yyyymmdd: event.yyyymmdd,
                hhmmss: event.hhmmss,
            }));

            return {
                dataType: 'eventInfo',
                year,
                month,
                data: eventData,
            };
        } else if (fileType === ReflectionType.ATTENDANCE_DATA) {
            // 근태 사용 내역 조회 (모든 직원)
            const usedAttendances = await manager
                .createQueryBuilder(UsedAttendance, 'ua')
                .leftJoinAndSelect('ua.attendanceType', 'at')
                .where('ua.used_at >= :startDate', { startDate: `${year}-${month.padStart(2, '0')}-01` })
                .andWhere('ua.used_at <= :endDate', {
                    endDate: `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`,
                })
                .andWhere('ua.deleted_at IS NULL')
                .orderBy('ua.used_at', 'ASC')
                .getMany();

            // id를 제외한 데이터만 추출
            const attendanceData = usedAttendances.map((ua) => ({
                used_at: ua.used_at,
                employee_id: ua.employee_id,
                attendance_type_id: ua.attendance_type_id,
                attendance_type_title: ua.attendanceType?.title || null,
            }));

            return {
                dataType: 'usedAttendance',
                year,
                month,
                data: attendanceData,
            };
        } else {
            return {
                dataType: 'unknown',
                year,
                month,
                data: [],
            };
        }
    }
}
