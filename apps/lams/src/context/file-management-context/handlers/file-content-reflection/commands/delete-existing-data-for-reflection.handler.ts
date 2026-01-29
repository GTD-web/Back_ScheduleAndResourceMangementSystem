import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeleteExistingDataForReflectionCommand } from './delete-existing-data-for-reflection.command';
import { EventInfo } from '../../../../../domain/event-info/event-info.entity';
import { UsedAttendance } from '../../../../../domain/used-attendance/used-attendance.entity';
import { FileType } from '../../../../../domain/file/file.types';

/**
 * 파일 내용 반영을 위한 기존 데이터 삭제 핸들러
 *
 * 해당 연월의 선택된 직원들의 기존 데이터를 하드 삭제합니다.
 * 파일 내용 반영 전에 이전 데이터를 제거하기 위해 사용됩니다.
 */
@CommandHandler(DeleteExistingDataForReflectionCommand)
export class DeleteExistingDataForReflectionHandler
    implements ICommandHandler<DeleteExistingDataForReflectionCommand, void>
{
    private readonly logger = new Logger(DeleteExistingDataForReflectionHandler.name);


    constructor(private readonly dataSource: DataSource) {}

    async execute(command: DeleteExistingDataForReflectionCommand): Promise<void> {
        const { fileType, year, month, employeeNumbers, selectedEmployeeIds, deleteAll } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            await this.해당연월기존데이터를삭제한다(
                fileType,
                year,
                month,
                employeeNumbers,
                selectedEmployeeIds,
                manager,
                deleteAll || false,
            );
        });
    }

    /**
     * 해당 연월의 기존 데이터를 하드 삭제한다
     * 
     * @param deleteAll true인 경우 전체 삭제, false인 경우 선택된 직원만 삭제
     */
    private async 해당연월기존데이터를삭제한다(
        fileType: string,
        year: string,
        month: string,
        employeeNumbers: string[],
        selectedEmployeeIds: string[],
        manager: any,
        deleteAll: boolean = false,
    ): Promise<void> {
        // 날짜 범위 계산
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        const endDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

        if (fileType === FileType.EVENT_HISTORY) {
            if (!deleteAll && employeeNumbers.length === 0) {
                return;
            }

            // 해당 연월의 EventInfo 하드 삭제
            let queryBuilder = manager
                .createQueryBuilder()
                .delete()
                .from(EventInfo)
                .where('yyyymmdd >= :startDate', { startDate })
                .andWhere('yyyymmdd <= :endDate', { endDate });

            // 전체 삭제가 아닌 경우에만 직원 필터링
            if (!deleteAll) {
                queryBuilder = queryBuilder.andWhere('employee_number IN (:...employeeNumbers)', {
                    employeeNumbers,
                });
            }

            const deleteResult = await queryBuilder.execute();

            this.logger.log(
                `기존 EventInfo 하드 삭제 완료: ${deleteResult.affected || 0}건 (연월: ${year}-${month}${deleteAll ? ', 전체' : `, 직원 수: ${employeeNumbers.length}명`})`,
            );
        } else if (fileType === FileType.ATTENDANCE_DATA) {
            if (!deleteAll && selectedEmployeeIds.length === 0) {
                return;
            }

            // 해당 연월의 UsedAttendance 하드 삭제
            const startDateStr = `${year}-${month.padStart(2, '0')}-01`;
            const endDateStr = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

            let queryBuilder = manager
                .createQueryBuilder()
                .delete()
                .from(UsedAttendance)
                .where('used_at >= :startDate', { startDate: startDateStr })
                .andWhere('used_at <= :endDate', { endDate: endDateStr });

            // 전체 삭제가 아닌 경우에만 직원 필터링
            if (!deleteAll) {
                queryBuilder = queryBuilder.andWhere('employee_id IN (:...employeeIds)', {
                    employeeIds: selectedEmployeeIds,
                });
            }

            const deleteResult = await queryBuilder.execute();

            this.logger.log(
                `기존 UsedAttendance 하드 삭제 완료: ${deleteResult.affected || 0}건 (연월: ${year}-${month}${deleteAll ? ', 전체' : `, 직원 수: ${selectedEmployeeIds.length}명`})`,
            );
        } else if (deleteAll) {
            // 전체 삭제인 경우 두 타입 모두 삭제
            // EventInfo 전체 삭제
            const eventDeleteResult = await manager
                .createQueryBuilder()
                .delete()
                .from(EventInfo)
                .where('yyyymmdd >= :startDate', { startDate })
                .andWhere('yyyymmdd <= :endDate', { endDate })
                .execute();

            this.logger.log(
                `기존 EventInfo 전체 삭제 완료: ${eventDeleteResult.affected || 0}건 (연월: ${year}-${month})`,
            );

            // UsedAttendance 전체 삭제
            const startDateStr = `${year}-${month.padStart(2, '0')}-01`;
            const endDateStr = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

            const attendanceDeleteResult = await manager
                .createQueryBuilder()
                .delete()
                .from(UsedAttendance)
                .where('used_at >= :startDate', { startDate: startDateStr })
                .andWhere('used_at <= :endDate', { endDate: endDateStr })
                .execute();

            this.logger.log(
                `기존 UsedAttendance 전체 삭제 완료: ${attendanceDeleteResult.affected || 0}건 (연월: ${year}-${month})`,
            );
        }
    }
}
