import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaveAttendanceSnapshotCommand } from './save-attendance-snapshot.command';
import { ISaveAttendanceSnapshotResponse } from '../../../interfaces';
import { DomainDataSnapshotInfoService } from '../../../../../domain/data-snapshot-info/data-snapshot-info.service';
import { SnapshotType } from '../../../../../domain/data-snapshot-info/data-snapshot-info.types';
import { GetMonthlySummariesQuery } from '../../../../attendance-data-context/handlers/attendance-data/queries/get-monthly-summaries.query';
import { DataSnapshotInfo } from '../../../../../domain/data-snapshot-info/data-snapshot-info.entity';
import { DataSnapshotChild } from '../../../../../domain/data-snapshot-child/data-snapshot-child.entity';
import { IMonthlyEventSummaryWithDailySummaries } from '../../../../attendance-data-context/interfaces/response/get-monthly-summaries-response.interface';

/**
 * 근태 스냅샷 저장 Handler
 *
 * 부서별로 계산된 월별요약-일별요약에 대한 데이터를 스냅샷으로 저장합니다.
 */
@CommandHandler(SaveAttendanceSnapshotCommand)
export class SaveAttendanceSnapshotHandler implements ICommandHandler<
    SaveAttendanceSnapshotCommand,
    ISaveAttendanceSnapshotResponse
> {
    private readonly logger = new Logger(SaveAttendanceSnapshotHandler.name);

    constructor(
        private readonly dataSnapshotInfoService: DomainDataSnapshotInfoService,
        private readonly queryBus: QueryBus,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: SaveAttendanceSnapshotCommand): Promise<ISaveAttendanceSnapshotResponse> {
        const {
            year,
            month,
            departmentId,
            snapshotName,
            description,
            performedBy,
            snapshotVersion,
            approvalDocumentId,
            submittedAt,
            approverName,
            approvalStatus,
        } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`근태 스냅샷 저장 시작: year=${year}, month=${month}, departmentId=${departmentId}`);

                // 1. 월간 요약 데이터 조회 (QueryBus를 통해 다른 컨텍스트의 Query 실행)
                const monthlySummariesResponse = await this.queryBus.execute(
                    new GetMonthlySummariesQuery({
                        year,
                        month,
                        departmentId,
                    }),
                );

                if (monthlySummariesResponse.monthlySummaries.length === 0) {
                    this.logger.log(`해당 연월에 월간 요약이 없습니다. year=${year}, month=${month}`);
                    return {
                        snapshot: null,
                    };
                }

                // 2. 스냅샷명 생성 (지정되지 않은 경우)
                const finalSnapshotName = snapshotName || `${year}년 ${month}월 근태 스냅샷 (부서: ${departmentId})`;

                // 3. 버전 자동 결정 (지정되지 않은 경우)
                const finalSnapshotVersion =
                    snapshotVersion || (await this.다음버전을결정한다(year, month, departmentId, manager));

                // 4. 스냅샷 정보 엔티티 생성 (자식 데이터와 함께 저장하기 위해 엔티티로 생성)
                const snapshotInfoEntity = new DataSnapshotInfo(
                    finalSnapshotName,
                    SnapshotType.MONTHLY,
                    year,
                    month,
                    departmentId,
                    description || '',
                    finalSnapshotVersion,
                    approvalDocumentId || null,
                    submittedAt || null,
                    approverName || null,
                    approvalStatus || null,
                );

                // 4. 월간 요약 데이터를 스냅샷 자식 데이터로 변환
                const snapshotChildren = this.월간요약을스냅샷자식으로변환한다(
                    monthlySummariesResponse.monthlySummaries,
                    year,
                    month,
                );

                // 5. 스냅샷 정보와 자식 데이터 연결
                snapshotInfoEntity.dataSnapshotChildInfoList = snapshotChildren;
                snapshotChildren.forEach((child) => {
                    child.parentSnapshot = snapshotInfoEntity;
                });

                // 6. 스냅샷 정보 및 자식 데이터 저장 (cascade 옵션으로 자식도 함께 저장됨)
                const savedSnapshot = await manager.save(snapshotInfoEntity);
                const snapshotInfo = savedSnapshot.DTO변환한다();

                this.logger.log(
                    `근태 스냅샷 저장 완료: snapshotId=${snapshotInfo.id}, 자식 수=${snapshotChildren.length}`,
                );

                return {
                    snapshot: snapshotInfo,
                };
            } catch (error) {
                this.logger.error(`근태 스냅샷 저장 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }

    /**
     * 월간 요약 데이터를 스냅샷 자식 데이터로 변환한다
     */
    private 월간요약을스냅샷자식으로변환한다(
        monthlySummaries: IMonthlyEventSummaryWithDailySummaries[],
        year: string,
        month: string,
    ): DataSnapshotChild[] {
        const yyyymm = `${year}-${month.padStart(2, '0')}`;

        return monthlySummaries.map((monthlySummary) => {
            // 전체 월간 요약 데이터(일간 요약 포함)를 JSON으로 변환
            const snapshotData = JSON.stringify(monthlySummary);

            // DataSnapshotChild 생성
            const child = new DataSnapshotChild(
                monthlySummary.employeeId,
                monthlySummary.employeeName || '',
                monthlySummary.employeeNumber || '',
                year,
                month,
                snapshotData,
            );

            return child;
        });
    }

    /**
     * 다음 버전을 결정한다 (A-Z)
     *
     * 연도, 월, 부서별로 기존 스냅샷을 조회하여 다음 버전을 결정합니다.
     * 기존 버전이 없으면 'A'를 반환하고, 있으면 다음 문자를 반환합니다.
     */
    private async 다음버전을결정한다(year: string, month: string, departmentId: string, manager: any): Promise<string> {
        // 연도, 월, 부서별 기존 스냅샷 조회
        const existingSnapshots = await this.dataSnapshotInfoService.연월부서별목록조회한다(
            year,
            month,
            departmentId,
            SnapshotType.MONTHLY,
            manager,
        );

        if (existingSnapshots.length === 0) {
            // 기존 스냅샷이 없으면 'A' 반환
            return 'A';
        }

        // 기존 버전 목록 추출 (null이 아닌 것만, A-Z 범위 검증)
        const existingVersions = existingSnapshots
            .map((s) => s.snapshotVersion)
            .filter((v): v is string => {
                if (!v || v.length !== 1) return false;
                const code = v.charCodeAt(0);
                return code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0);
            })
            .map((v) => v.charCodeAt(0))
            .sort((a, b) => a - b);

        if (existingVersions.length === 0) {
            // 버전이 없는 스냅샷만 있으면 'A' 반환
            return 'A';
        }

        // 가장 높은 버전 찾기
        const highestVersionCode = existingVersions[existingVersions.length - 1];

        // Z를 초과하면 에러
        if (highestVersionCode >= 'Z'.charCodeAt(0)) {
            throw new Error('스냅샷 버전이 Z에 도달했습니다. 더 이상 버전을 생성할 수 없습니다.');
        }

        // 다음 버전 반환
        return String.fromCharCode(highestVersionCode + 1);
    }
}
