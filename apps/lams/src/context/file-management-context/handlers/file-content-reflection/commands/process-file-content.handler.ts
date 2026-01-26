import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProcessFileContentCommand } from './process-file-content.command';
import { DomainFileService } from '../../../../../domain/file/file.service';
import { DomainEventInfoService } from '../../../../../domain/event-info/event-info.service';
import { DomainUsedAttendanceService } from '../../../../../domain/used-attendance/used-attendance.service';
import { EventInfo } from '../../../../../domain/event-info/event-info.entity';
import { UsedAttendance } from '../../../../../domain/used-attendance/used-attendance.entity';
import { In } from 'typeorm';
import { DomainAttendanceTypeService } from '../../../../../domain/attendance-type/attendance-type.service';
import { Employee } from '@libs/modules/employee/employee.entity';
import { DomainEmployeeService } from '@libs/modules/employee/employee.service';
import { FileType } from '../../../../../domain/file/file.types';

/**
 * 파일 내용 가공 핸들러
 *
 * 파일 엔티티에 저장된 데이터를 가공하여 반영 가능한 형태로 변환합니다.
 *
 * 1. 파일 엔티티에서 저장된 파일 내용 정보를 조회한다
 * 2. 적용 대상 직원 정보를 조회한다
 * 3. 근태 유형 정보를 조회한다 (근태 사용 내역인 경우)
 * 4. 파일 내용을 파싱하여 선택된 직원의 데이터만 필터링 및 가공한다
 *    - EventInfo 엔티티 형식으로 변환 (출입 이벤트 데이터인 경우)
 *    - UsedAttendance 엔티티 형식으로 변환 (근태 사용 내역인 경우)
 * 5. 가공된 데이터와 메타 정보를 반환한다
 *
 * 주의: 실제 데이터 저장은 SaveReflectedDataHandler에서 처리하며,
 *      이력 저장은 SaveReflectionHistoryHandler에서 처리합니다.
 */
@CommandHandler(ProcessFileContentCommand)
export class ProcessFileContentHandler implements ICommandHandler<
    ProcessFileContentCommand,
    {
        fileId: string;
        processedData: {
            eventInfos: Partial<EventInfo>[];
            usedAttendances: Partial<UsedAttendance>[];
            processedEmployeeIds: string[];
        };
        employeeNumbers: string[];
        selectedEmployeeIds: string[];
        fileType: string;
        year: string;
        month: string;
        employeeIds: string[];
    }
> {
    private readonly logger = new Logger(ProcessFileContentHandler.name);


    constructor(
        private readonly fileService: DomainFileService,
        private readonly attendanceTypeService: DomainAttendanceTypeService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: ProcessFileContentCommand): Promise<{
        fileId: string;
        processedData: {
            eventInfos: Partial<EventInfo>[];
            usedAttendances: Partial<UsedAttendance>[];
            processedEmployeeIds: string[];
        };
        employeeNumbers: string[];
        selectedEmployeeIds: string[];
        fileType: string;
        year: string;
        month: string;
        employeeIds: string[];
        info?: string;
    }> {
        const { fileId, employeeIds, year, month } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`파일 내용 가공 시작: fileId=${fileId}, 직원 수=${employeeIds.length}`);

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
                const fileType = file.data.fileType as string;

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
                if (fileType === FileType.ATTENDANCE_DATA) {
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

                return {
                    fileId,
                    processedData,
                    employeeNumbers: Array.from(employeeMap.keys()),
                    selectedEmployeeIds: Array.from(employeeIdMap.values()),
                    fileType,
                    year,
                    month,
                    employeeIds,
                };
            } catch (error) {
                this.logger.error(`파일 내용 가공 실패: ${error.message}`, error.stack);

                if (error instanceof NotFoundException || error instanceof BadRequestException) {
                    throw error;
                }
                throw new BadRequestException(`파일 내용 가공 중 오류가 발생했습니다: ${error.message}`);
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
        fileType: string,
    ): Promise<{
        eventInfos: Partial<EventInfo>[];
        usedAttendances: Partial<UsedAttendance>[];
        processedEmployeeIds: string[];
    }> {
        const eventInfos: Partial<EventInfo>[] = [];
        const usedAttendances: Partial<UsedAttendance>[] = [];
        const processedEmployeeIds: string[] = [];

        if (fileType === FileType.EVENT_HISTORY) {
            // 출입 이벤트 데이터 처리
            // excelData는 직원별로 그룹화되어 있음: { employeeNumber: [row1, row2, ...] }
            Object.entries(excelData).forEach(([employeeNumber, rows]) => {
                // employeeMap에 있는 직원만 처리 (employeeIds에 해당하는 직원)
                if (!employeeMap.has(employeeNumber)) {
                    return;
                }

                // 날짜별로 그룹화: { yyyymmdd: [row1, row2, ...] }
                const dateGroupedRows = new Map<string, Array<{
                    row: Record<string, any>;
                    eventTime: string;
                    yyyymmdd: string;
                    hhmmss: string;
                    timeValue: number; // 시간 비교를 위한 숫자 값 (hhmmss를 숫자로 변환)
                }>>();

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
                    const timeValue = parseInt(hhmmss, 10); // 시간 비교를 위한 숫자 값

                    // 날짜별로 그룹화
                    if (!dateGroupedRows.has(yyyymmdd)) {
                        dateGroupedRows.set(yyyymmdd, []);
                    }
                    dateGroupedRows.get(yyyymmdd)!.push({
                        row,
                        eventTime,
                        yyyymmdd,
                        hhmmss,
                        timeValue,
                    });
                });

                // 각 날짜별로 가장 처음과 마지막 기록만 추출
                dateGroupedRows.forEach((dayRows, yyyymmdd) => {
                    // 시간 순으로 정렬
                    dayRows.sort((a, b) => a.timeValue - b.timeValue);

                    // 가장 처음 기록 (최소 시간)
                    const firstRecord = dayRows[0];
                    eventInfos.push({
                        employee_name: firstRecord.row.name || '',
                        employee_number: employeeNumber || null,
                        event_time: firstRecord.eventTime,
                        yyyymmdd: firstRecord.yyyymmdd,
                        hhmmss: firstRecord.hhmmss,
                    });

                    // 가장 마지막 기록 (최대 시간) - 첫 번째와 다른 경우에만 추가
                    if (dayRows.length > 1) {
                        const lastRecord = dayRows[dayRows.length - 1];
                        eventInfos.push({
                            employee_name: lastRecord.row.name || '',
                            employee_number: employeeNumber || null,
                            event_time: lastRecord.eventTime,
                            yyyymmdd: lastRecord.yyyymmdd,
                            hhmmss: lastRecord.hhmmss,
                        });
                    }
                });

                if (!processedEmployeeIds.includes(employeeNumber)) {
                    processedEmployeeIds.push(employeeNumber);
                }
            });
        } else if (fileType === FileType.ATTENDANCE_DATA) {
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

}
