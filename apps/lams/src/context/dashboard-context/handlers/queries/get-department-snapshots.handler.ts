import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetDepartmentSnapshotsQuery } from './get-department-snapshots.query';
import { IGetDepartmentSnapshotsResponse } from '../../interfaces';
import { DomainDataSnapshotInfoService } from '../../../../domain/data-snapshot-info/data-snapshot-info.service';
import { SnapshotType } from '../../../../domain/data-snapshot-info/data-snapshot-info.types';

/**
 * 부서별 연도, 월별 스냅샷 조회 Query Handler
 *
 * 특정 부서의 연도, 월별 스냅샷 목록을 조회합니다.
 */
@QueryHandler(GetDepartmentSnapshotsQuery)
export class GetDepartmentSnapshotsHandler
    implements IQueryHandler<GetDepartmentSnapshotsQuery, IGetDepartmentSnapshotsResponse>
{
    private readonly logger = new Logger(GetDepartmentSnapshotsHandler.name);

    constructor(private readonly dataSnapshotInfoService: DomainDataSnapshotInfoService) {}

    async execute(query: GetDepartmentSnapshotsQuery): Promise<IGetDepartmentSnapshotsResponse> {
        const { departmentId, year, month } = query.data;

        this.logger.log(`부서별 연도, 월별 스냅샷 조회: departmentId=${departmentId}, year=${year}, month=${month}`);

        // 스냅샷 목록 조회 (children 포함)
        const snapshots = await this.dataSnapshotInfoService.연월과타입으로목록조회한다(
            year,
            month,
            SnapshotType.MONTHLY,
        );

        // 부서별 필터링
        const departmentSnapshots = snapshots.filter((s) => s.departmentId === departmentId);

        const snapshotInfos = departmentSnapshots.map((snapshot) => {
            const children = (snapshot.children || []).map((child) => ({
                id: child.id,
                employeeId: child.employeeId,
                employeeName: child.employeeName,
                employeeNumber: child.employeeNumber,
                yyyy: child.yyyy,
                mm: child.mm,
                snapshotData: child.snapshotData,
                rawData: child.rawData || null,
            }));

            return {
                id: snapshot.id,
                snapshotName: snapshot.snapshotName,
                year: snapshot.yyyy,
                month: snapshot.mm,
                createdAt: snapshot.createdAt.toISOString(),
                children,
            };
        });

        return {
            departmentId,
            year,
            month,
            snapshots: snapshotInfos,
        };
    }
}
