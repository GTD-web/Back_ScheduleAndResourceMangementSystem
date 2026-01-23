import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { endOfMonth, format } from 'date-fns';
import { GetSnapshotListWithDepartmentChildrenQuery } from './get-snapshot-list-with-department-children.query';
import { IGetSnapshotListResponse } from '../../../interfaces/response/get-snapshot-list-response.interface';
import { DomainDataSnapshotInfoService } from '../../../../../domain/data-snapshot-info/data-snapshot-info.service';
import { SnapshotType } from '../../../../../domain/data-snapshot-info/data-snapshot-info.types';
import { DomainEmployeeDepartmentPositionHistoryService } from '@libs/modules/employee-department-position-history/employee-department-position-history.service';

/**
 * 부서 기준 스냅샷 목록 조회 Query Handler
 *
 * 스냅샷 목록은 연월 기준으로 조회하고, 자식 정보는 특정 부서 소속 직원만 반환합니다.
 */
@QueryHandler(GetSnapshotListWithDepartmentChildrenQuery)
export class GetSnapshotListWithDepartmentChildrenHandler implements IQueryHandler<
    GetSnapshotListWithDepartmentChildrenQuery,
    IGetSnapshotListResponse
> {
    private readonly logger = new Logger(GetSnapshotListWithDepartmentChildrenHandler.name);

    constructor(
        private readonly dataSnapshotInfoService: DomainDataSnapshotInfoService,
        private readonly employeeDepartmentPositionHistoryService: DomainEmployeeDepartmentPositionHistoryService,
    ) {}

    async execute(
        query: GetSnapshotListWithDepartmentChildrenQuery,
    ): Promise<IGetSnapshotListResponse> {
        const { year, month, departmentId, sortBy = 'latest', filters } = query.data;

        this.logger.log(
            `스냅샷 목록 조회 시작(부서 자식 필터): year=${year}, month=${month}, departmentId=${departmentId}`,
        );

        const employeeIds = await this.부서별직원목록을조회한다(year, month, departmentId);
        const allSnapshots = await this.dataSnapshotInfoService.연월과타입으로목록조회_자식직원필터한다(
            year,
            month,
            SnapshotType.MONTHLY,
            employeeIds,
        );

        let filteredSnapshots = allSnapshots;
        if (filters) {
            filteredSnapshots = this.필터적용한다(filteredSnapshots, filters);
        }

        const sortedSnapshots = this.정렬적용한다(filteredSnapshots, sortBy);
        const latestSnapshot = sortedSnapshots.length > 0 ? sortedSnapshots[0] : null;

        this.logger.log(
            `스냅샷 목록 조회 완료(부서 자식 필터): totalCount=${sortedSnapshots.length}, latestSnapshotId=${latestSnapshot?.id || '없음'}`,
        );

        return {
            latestSnapshot,
            snapshots: sortedSnapshots,
            totalCount: sortedSnapshots.length,
        };
    }

    private async 부서별직원목록을조회한다(
        year: string,
        month: string,
        departmentId: string,
    ): Promise<string[]> {
        const yearNumber = parseInt(year, 10);
        const monthNumber = parseInt(month, 10);
        const monthEndDate = format(endOfMonth(new Date(yearNumber, monthNumber - 1, 1)), 'yyyy-MM-dd');
        const histories = await this.employeeDepartmentPositionHistoryService.findByDepartmentAtDate(
            departmentId,
            monthEndDate,
        );
        return histories.map((history) => history.employeeId).filter((id) => id);
    }

    private 필터적용한다(
        snapshots: any[],
        filters: { snapshotType?: string; dateRange?: { startDate?: string; endDate?: string } },
    ): any[] {
        let filtered = [...snapshots];

        if (filters.snapshotType) {
            filtered = filtered.filter((snapshot) => snapshot.snapshotType === filters.snapshotType);
        }

        if (filters.dateRange) {
            const { startDate, endDate } = filters.dateRange;
            if (startDate) {
                filtered = filtered.filter((snapshot) => new Date(snapshot.createdAt) >= new Date(startDate));
            }
            if (endDate) {
                filtered = filtered.filter((snapshot) => new Date(snapshot.createdAt) <= new Date(endDate));
            }
        }

        return filtered;
    }

    private 정렬적용한다(snapshots: any[], sortBy: string): any[] {
        const sorted = [...snapshots];

        switch (sortBy) {
            case 'latest':
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'name':
                sorted.sort((a, b) => a.snapshotName.localeCompare(b.snapshotName, 'ko'));
                break;
            case 'type':
                sorted.sort((a, b) => a.snapshotType.localeCompare(b.snapshotType));
                break;
            default:
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        return sorted;
    }
}
