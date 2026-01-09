import { Module } from '@nestjs/common';
import { MetadataSyncContext } from './metadata-sync.context';
import { DomainPositionModule } from '../../domain/position/position.module';
import { DomainRankModule } from '../../domain/rank/rank.module';
import { DomainDepartmentModule } from '../../domain/department/department.module';
import { DomainEmployeeModule } from '../../domain/employee/employee.module';
import { DomainEmployeeDepartmentPositionModule } from '../../domain/employee-department-position/employee-department-position.module';

@Module({
    imports: [
        DomainPositionModule,
        DomainRankModule,
        DomainDepartmentModule,
        DomainEmployeeModule,
        DomainEmployeeDepartmentPositionModule,
    ],
    providers: [MetadataSyncContext],
    exports: [MetadataSyncContext],
})
export class MetadataSyncModule {}
