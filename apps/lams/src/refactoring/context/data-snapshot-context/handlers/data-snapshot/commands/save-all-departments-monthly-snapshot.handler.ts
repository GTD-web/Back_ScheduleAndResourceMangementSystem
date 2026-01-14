import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaveAllDepartmentsMonthlySnapshotCommand } from './save-all-departments-monthly-snapshot.command';
import { SaveAttendanceSnapshotCommand } from './save-attendance-snapshot.command';
import { DomainEmployeeDepartmentPositionHistoryService } from '@libs/modules/employee-department-position-history/employee-department-position-history.service';
import { MonthlyEventSummary } from '../../../../../domain/monthly-event-summary/monthly-event-summary.entity';

/**
 * 해당 연월의 모든 부서 월간 요약 스냅샷 저장 Handler
 *
 * 해당 연월에 월간 요약이 있는 모든 부서의 스냅샷을 저장합니다.
 */
@CommandHandler(SaveAllDepartmentsMonthlySnapshotCommand)
export class SaveAllDepartmentsMonthlySnapshotHandler implements ICommandHandler<
    SaveAllDepartmentsMonthlySnapshotCommand,
    void
> {
    private readonly logger = new Logger(SaveAllDepartmentsMonthlySnapshotHandler.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly dataSource: DataSource,
        private readonly employeeDepartmentPositionHistoryService: DomainEmployeeDepartmentPositionHistoryService,
    ) {}

    async execute(command: SaveAllDepartmentsMonthlySnapshotCommand): Promise<void> {
        const { year, month, performedBy } = command.data;

        // 해당연월에 월간 요약이 있는지 확인하고 없으면 종료
        const yyyymm = `${year}-${month.padStart(2, '0')}`;
        const count = await this.dataSource.manager
            .createQueryBuilder(MonthlyEventSummary, 'monthly')
            .where('monthly.deleted_at IS NULL')
            .andWhere('monthly.yyyymm = :yyyymm', { yyyymm })
            .getCount();

        if (count === 0) {
            this.logger.log(`해당 연월에 월간 요약이 없습니다. year=${year}, month=${month}`);
            return;
        }

        try {
            // 해당 연월에 월간 요약이 있는 모든 부서를 찾는 경우
            const departments = await this.employeeDepartmentPositionHistoryService.특정연월의부서정보목록을조회한다(
                year,
                month,
            );

            this.logger.log(
                `해당 연월에 월간 요약이 있는 부서 수: ${departments.length}개 (year=${year}, month=${month})`,
            );

            // 각 부서별로 스냅샷 저장 (CommandBus를 통해 다른 Command 실행)
            for (const dept of departments) {
                try {
                    this.logger.log(
                        `기존 월간 요약 스냅샷 저장 시도: departmentId=${dept.id}, departmentName=${dept.departmentName}`,
                    );

                    // CommandBus를 통해 SaveAttendanceSnapshotCommand 실행
                    await this.commandBus.execute(
                        new SaveAttendanceSnapshotCommand({
                            year,
                            month,
                            departmentId: dept.id,
                            snapshotName: `${year}년 ${month}월 근태 스냅샷 (${dept.departmentName}) - 파일 반영 전 백업`,
                            description: `파일 내용 반영 전 기존 데이터 백업`,
                            performedBy,
                        }),
                    );

                    this.logger.log(`기존 월간 요약 스냅샷 저장 완료: departmentId=${dept.id}`);
                } catch (error) {
                    // 특정 부서의 스냅샷 저장 실패가 전체 프로세스를 중단시키지 않도록 에러 로깅만 수행
                    this.logger.warn(
                        `부서별 스냅샷 저장 실패 (계속 진행): departmentId=${dept.id}, error=${error.message}`,
                    );
                }
            }
        } catch (error) {
            // 스냅샷 저장 실패가 전체 프로세스를 중단시키지 않도록 에러 로깅만 수행
            this.logger.warn(`기존 월간 요약 스냅샷 저장 실패 (계속 진행): ${error.message}`);
        }
    }
}
