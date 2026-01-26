import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetDepartmentListQuery } from './get-department-list.query';
import {
    IGetDepartmentListResponse,
    IDepartmentNode,
    IDepartmentInfo,
} from '../../../interfaces/response/get-department-list-response.interface';
import { DomainDepartmentService } from '@libs/modules/department/department.service';
import { DomainEmployeeDepartmentPositionHistoryService } from '@libs/modules/employee-department-position-history/employee-department-position-history.service';
import { Department } from '@libs/modules/department/department.entity';
import { startOfMonth, endOfMonth, format } from 'date-fns';

/**
 * 부서 목록 조회 Query Handler
 *
 * 요청받은 연월을 기준으로 해당 월에 유효했던 조직도 상태를 반환합니다.
 * 계층구조와 1차원 배열 두 가지 형태로 제공합니다.
 */
@QueryHandler(GetDepartmentListQuery)
export class GetDepartmentListHandler implements IQueryHandler<GetDepartmentListQuery, IGetDepartmentListResponse> {
    private readonly logger = new Logger(GetDepartmentListHandler.name);

    constructor(
        private readonly departmentService: DomainDepartmentService,
        private readonly employeeDepartmentPositionHistoryService: DomainEmployeeDepartmentPositionHistoryService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(query: GetDepartmentListQuery): Promise<IGetDepartmentListResponse> {
        const { year, month } = query.data;

        this.logger.log(`부서 목록 조회 시작: year=${year}, month=${month}`);

        // 날짜 범위 계산
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const monthStart = startOfMonth(new Date(yearNum, monthNum - 1, 1));
        const monthEnd = endOfMonth(new Date(yearNum, monthNum - 1, 1));
        const endDate = format(monthEnd, 'yyyy-MM-dd');

        // 1. 해당 연월에 유효한 배치이력 목록 조회
        const employeeHistories = await this.employeeDepartmentPositionHistoryService.특정연월의배치이력목록을조회한다(
            year,
            month,
        );

        if (employeeHistories.length === 0) {
            this.logger.warn(`해당 연월에 유효한 배치이력이 없습니다. year=${year}, month=${month}`);
            return {
                hierarchy: [],
                flatList: [],
                totalDepartments: 0,
                totalEmployees: 0,
            };
        }

        // 2. 배치이력에서 부서 ID와 부모 부서 ID 추출 및 직원 수 계산
        const departmentEmployeeCountMap = new Map<string, number>();
        const allRequiredDepartmentIds = new Set<string>();

        for (const history of employeeHistories) {
            if (history.departmentId) {
                // 배치이력에 저장된 부서 ID 추가
                allRequiredDepartmentIds.add(history.departmentId);

                // 배치이력에 저장된 부모 부서 ID 추가 (해당 시점의 조직 구조)
                if (history.parentDepartmentId) {
                    allRequiredDepartmentIds.add(history.parentDepartmentId);
                }

                // 직원 수 계산
                const currentCount = departmentEmployeeCountMap.get(history.departmentId) || 0;
                departmentEmployeeCountMap.set(history.departmentId, currentCount + 1);
            }
        }

        // 3. 필요한 모든 부서들의 상세 정보 조회 (퇴사자 부서 제외)
        const allDepartments = await this.dataSource.manager
            .createQueryBuilder(Department, 'dept')
            .where('dept.id IN (:...ids)', { ids: Array.from(allRequiredDepartmentIds) })
            .andWhere('dept.departmentName != :excludedDepartmentName', { excludedDepartmentName: '퇴사자' })
            .orderBy('dept.order', 'ASC')
            .getMany();

        // 부서 ID로 부서 정보를 빠르게 조회하기 위한 맵 생성
        const departmentMapById = new Map<string, Department>();
        for (const dept of allDepartments) {
            departmentMapById.set(dept.id, dept);
        }

        // 4. 배치이력에 저장된 부모-자식 관계를 기준으로 부서 관계 맵 생성
        // 배치이력의 parentDepartmentId가 해당 시점의 조직 구조를 나타냄
        const departmentParentMap = new Map<string, string | null>();
        for (const history of employeeHistories) {
            if (history.departmentId) {
                // 배치이력에 저장된 부모 부서 ID를 사용 (해당 시점의 조직 구조)
                const parentId = history.parentDepartmentId || null;
                // 같은 부서에 여러 배치이력이 있을 수 있으므로, 첫 번째로 설정된 부모 관계를 사용
                if (!departmentParentMap.has(history.departmentId)) {
                    departmentParentMap.set(history.departmentId, parentId);
                }
            }
        }

        // 부서별 직원 수 설정 (배치이력에 없는 상위 부서는 0)
        for (const dept of allDepartments) {
            if (!departmentEmployeeCountMap.has(dept.id)) {
                departmentEmployeeCountMap.set(dept.id, 0);
            }
        }

        // 5. 1차원 배열 생성 (배치이력의 부모-자식 관계 사용)
        const flatList: IDepartmentInfo[] = allDepartments.map((dept) => ({
            id: dept.id,
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName,
            parentDepartmentId: departmentParentMap.get(dept.id) || null,
            type: dept.type,
            order: dept.order,
            employeeCount: departmentEmployeeCountMap.get(dept.id) || 0,
        }));

        // 6. 계층구조 생성 (배치이력의 부모-자식 관계 사용)
        const departmentNodeMap = new Map<string, IDepartmentNode>();
        const rootDepartments: IDepartmentNode[] = [];

        // 모든 부서를 노드로 변환
        for (const dept of allDepartments) {
            const parentId = departmentParentMap.get(dept.id) || null;
            const node: IDepartmentNode = {
                id: dept.id,
                departmentCode: dept.departmentCode,
                departmentName: dept.departmentName,
                parentDepartmentId: parentId,
                type: dept.type,
                order: dept.order,
                employeeCount: departmentEmployeeCountMap.get(dept.id) || 0,
                children: [],
            };
            departmentNodeMap.set(dept.id, node);
        }

        // 배치이력의 부모-자식 관계를 기준으로 계층구조 설정
        for (const dept of allDepartments) {
            const node = departmentNodeMap.get(dept.id)!;
            const parentId = departmentParentMap.get(dept.id);

            if (parentId && departmentNodeMap.has(parentId)) {
                // 배치이력에 저장된 부모가 유효한 부서 목록에 있는 경우
                const parent = departmentNodeMap.get(parentId)!;
                parent.children.push(node);
                // order로 정렬
                parent.children.sort((a, b) => a.order - b.order);
            } else {
                // 루트 부서 (부모가 없거나 유효한 부서 목록에 없는 경우)
                rootDepartments.push(node);
            }
        }

        // 루트 부서들을 order로 정렬
        rootDepartments.sort((a, b) => a.order - b.order);

        // 8. 전체 직원 수 계산
        const totalEmployees = Array.from(departmentEmployeeCountMap.values()).reduce((sum, count) => sum + count, 0);

        this.logger.log(
            `부서 목록 조회 완료: totalDepartments=${allDepartments.length}, totalEmployees=${totalEmployees}`,
        );

        return {
            hierarchy: rootDepartments,
            flatList,
            totalDepartments: allDepartments.length,
            totalEmployees,
        };
    }
}
