import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetDepartmentListForPermissionQuery } from './get-department-list-for-permission.query';
import {
    IGetDepartmentListForPermissionResponse,
    IDepartmentInfoForPermission,
} from '../../../interfaces/response/get-department-list-for-permission-response.interface';
import { Department } from '@libs/modules/department/department.entity';

/**
 * 권한 관리용 부서 목록 조회 Query Handler
 *
 * 퇴사자 부서를 제외한 전체 부서 목록을 조회합니다.
 */
@QueryHandler(GetDepartmentListForPermissionQuery)
export class GetDepartmentListForPermissionHandler
    implements IQueryHandler<GetDepartmentListForPermissionQuery, IGetDepartmentListForPermissionResponse>
{
    private readonly logger = new Logger(GetDepartmentListForPermissionHandler.name);

    constructor(private readonly dataSource: DataSource) {}

    async execute(query: GetDepartmentListForPermissionQuery): Promise<IGetDepartmentListForPermissionResponse> {
        this.logger.log('권한 관리용 부서 목록 조회 시작');

        // 퇴사자 부서를 제외한 전체 부서 목록 조회
        const departments = await this.dataSource.manager
            .createQueryBuilder(Department, 'dept')
            .where('dept.departmentName != :excludedDepartmentName', { excludedDepartmentName: '퇴사자' })
            .orderBy('dept.order', 'ASC')
            .getMany();

        const departmentList: IDepartmentInfoForPermission[] = departments.map((dept) => ({
            id: dept.id,
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName,
            type: dept.type,
            order: dept.order,
        }));

        this.logger.log(`권한 관리용 부서 목록 조회 완료: totalCount=${departmentList.length}`);

        return {
            departments: departmentList,
            totalCount: departmentList.length,
        };
    }
}
