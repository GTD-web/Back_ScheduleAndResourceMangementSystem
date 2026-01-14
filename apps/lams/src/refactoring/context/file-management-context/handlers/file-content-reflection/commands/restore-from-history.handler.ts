import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RestoreFromHistoryCommand } from './restore-from-history.command';
import { IRestoreFromHistoryResponse } from '../../../interfaces';
import { DomainFileContentReflectionHistoryService } from '../../../../../domain/file-content-reflection-history/file-content-reflection-history.service';
import {
    ReflectionStatus,
    ReflectionType,
} from '../../../../../domain/file-content-reflection-history/file-content-reflection-history.types';
import { EventInfo } from '../../../../../domain/event-info/event-info.entity';
import { UsedAttendance } from '../../../../../domain/used-attendance/used-attendance.entity';
import { Employee } from '@libs/modules/employee/employee.entity';
import { In } from 'typeorm';

/**
 * 이력으로 되돌리기 핸들러
 *
 * 1. 이력 ID로 이력을 조회한다
 * 2. 이력의 data에 저장된 데이터를 그대로 사용한다
 * 3. 해당 연월의 기존 데이터를 삭제한다
 * 4. 이력 데이터를 삽입한다
 */
@CommandHandler(RestoreFromHistoryCommand)
export class RestoreFromHistoryHandler implements ICommandHandler<
    RestoreFromHistoryCommand,
    IRestoreFromHistoryResponse
> {
    private readonly logger = new Logger(RestoreFromHistoryHandler.name);

    constructor(
        private readonly fileContentReflectionHistoryService: DomainFileContentReflectionHistoryService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: RestoreFromHistoryCommand): Promise<IRestoreFromHistoryResponse> {
        const { reflectionHistoryId, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`이력으로 되돌리기 시작: reflectionHistoryId=${reflectionHistoryId}`);

                // 1. 이력 조회
                const history = await this.fileContentReflectionHistoryService.ID로조회한다(reflectionHistoryId);
                if (!history || !history.data) {
                    throw new NotFoundException(
                        `이력을 찾을 수 없거나 데이터가 없습니다. (id: ${reflectionHistoryId})`,
                    );
                }

                const historyData = history.data as {
                    dataType: string;
                    year: string;
                    month: string;
                    data: any[];
                };

                if (!historyData.year || !historyData.month || !historyData.dataType) {
                    throw new BadRequestException('이력 데이터 형식이 올바르지 않습니다.');
                }

                const { year, month, dataType } = historyData;
                const fileType = history.type;

                this.logger.log(
                    `이력 데이터 확인: year=${year}, month=${month}, fileType=${fileType}, dataType=${dataType}, dataCount=${historyData.data.length}`,
                );

                // 2. 해당 연월의 기존 데이터 삭제 (전체 삭제)
                await this.해당연월기존데이터전체삭제한다(fileType, year, month, manager);

                // 3. 이력 데이터 삽입
                let insertedCount = 0;
                if (fileType === ReflectionType.EVENT_HISTORY && dataType === 'eventInfo') {
                    // EventInfo 데이터 삽입
                    if (historyData.data.length > 0) {
                        const EVENT_BATCH_SIZE = 10000;
                        for (let i = 0; i < historyData.data.length; i += EVENT_BATCH_SIZE) {
                            const batch = historyData.data.slice(i, i + EVENT_BATCH_SIZE);
                            await manager.createQueryBuilder().insert().into(EventInfo).values(batch).execute();
                        }
                        insertedCount = historyData.data.length;
                    }
                } else if (fileType === ReflectionType.ATTENDANCE_DATA && dataType === 'usedAttendance') {
                    // UsedAttendance 데이터 삽입
                    if (historyData.data.length > 0) {
                        const ATTENDANCE_BATCH_SIZE = 1000;
                        for (let i = 0; i < historyData.data.length; i += ATTENDANCE_BATCH_SIZE) {
                            const batch = historyData.data.slice(i, i + ATTENDANCE_BATCH_SIZE);
                            await manager.createQueryBuilder().insert().into(UsedAttendance).values(batch).execute();
                        }
                        insertedCount = historyData.data.length;
                    }
                } else {
                    throw new BadRequestException(
                        `지원하지 않는 데이터 타입입니다. fileType=${fileType}, dataType=${dataType}`,
                    );
                }

                this.logger.log(`이력 데이터 삽입 완료: ${insertedCount}건`);

                this.logger.log(`✅ 이력으로 되돌리기 완료: reflectionHistoryId=${reflectionHistoryId}`);

                return {
                    reflectionHistoryId,
                    year,
                    month,
                };
            } catch (error) {
                this.logger.error(`이력으로 되돌리기 실패: ${error.message}`, error.stack);

                if (error instanceof NotFoundException || error instanceof BadRequestException) {
                    throw error;
                }
                throw new BadRequestException(`이력으로 되돌리기 중 오류가 발생했습니다: ${error.message}`);
            }
        });
    }

    /**
     * 해당 연월의 기존 데이터를 전체 삭제한다
     */
    private async 해당연월기존데이터전체삭제한다(
        fileType: ReflectionType,
        year: string,
        month: string,
        manager: any,
    ): Promise<void> {
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = `${year}${month.padStart(2, '0')}01`;
        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        const endDate = `${year}${month.padStart(2, '0')}${lastDay.toString().padStart(2, '0')}`;

        if (fileType === ReflectionType.EVENT_HISTORY) {
            // 해당 연월의 모든 EventInfo 하드 삭제
            const deleteResult = await manager
                .createQueryBuilder()
                .delete()
                .from(EventInfo)
                .where('yyyymmdd >= :startDate', { startDate })
                .andWhere('yyyymmdd <= :endDate', { endDate })
                .execute();

            this.logger.log(`기존 EventInfo 전체 삭제 완료: ${deleteResult.affected || 0}건 (연월: ${year}-${month})`);
        } else if (fileType === ReflectionType.ATTENDANCE_DATA) {
            // 해당 연월의 모든 UsedAttendance 하드 삭제
            const startDateStr = `${year}-${month.padStart(2, '0')}-01`;
            const endDateStr = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

            const deleteResult = await manager
                .createQueryBuilder()
                .delete()
                .from(UsedAttendance)
                .where('used_at >= :startDate', { startDate: startDateStr })
                .andWhere('used_at <= :endDate', { endDate: endDateStr })
                .execute();

            this.logger.log(
                `기존 UsedAttendance 전체 삭제 완료: ${deleteResult.affected || 0}건 (연월: ${year}-${month})`,
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

    /**
     * 이력에서 직원 ID 목록을 추출한다
     */
    private async 이력에서직원ID목록을추출한다(
        historyData: { dataType: string; data: any[] },
        fileType: ReflectionType,
        manager: any,
    ): Promise<string[]> {
        const employeeIds = new Set<string>();

        if (fileType === ReflectionType.EVENT_HISTORY && historyData.dataType === 'eventInfo') {
            // EventInfo 데이터에서 employee_number로 직원 조회
            const employeeNumbers = new Set<string>();
            historyData.data.forEach((item) => {
                if (item.employee_number) {
                    employeeNumbers.add(item.employee_number);
                }
            });

            if (employeeNumbers.size > 0) {
                const employees = await manager.find(Employee, {
                    where: { employeeNumber: In(Array.from(employeeNumbers)) },
                });
                employees.forEach((emp: Employee) => {
                    if (emp.id) {
                        employeeIds.add(emp.id);
                    }
                });
            }
        } else if (fileType === ReflectionType.ATTENDANCE_DATA && historyData.dataType === 'usedAttendance') {
            // UsedAttendance 데이터에서 employee_id 직접 추출
            historyData.data.forEach((item) => {
                if (item.employee_id) {
                    employeeIds.add(item.employee_id);
                }
            });
        }

        return Array.from(employeeIds);
    }
}
