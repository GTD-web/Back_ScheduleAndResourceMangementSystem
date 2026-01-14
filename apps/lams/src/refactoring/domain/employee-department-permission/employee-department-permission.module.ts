import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeDepartmentPermission } from './employee-department-permission.entity';
import { DomainEmployeeDepartmentPermissionService } from './employee-department-permission.service';

/**
 * 직원-부서 권한 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([EmployeeDepartmentPermission])],
    providers: [DomainEmployeeDepartmentPermissionService],
    exports: [DomainEmployeeDepartmentPermissionService, TypeOrmModule],
})
export class DomainEmployeeDepartmentPermissionModule {}
