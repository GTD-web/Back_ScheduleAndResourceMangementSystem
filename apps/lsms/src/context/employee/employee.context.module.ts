import { Module } from '@nestjs/common';
import { EmployeeContextService } from './employee.context.service';
import { DomainEmployeeModule } from '../../domain/employee/employee.module';
import { DomainDepartmentModule } from '../../domain/department/department.module';
import { DomainDepartmentEmployeeModule } from '../../domain/department-employee/department-employee.module';

@Module({
    imports: [DomainEmployeeModule, DomainDepartmentModule, DomainDepartmentEmployeeModule],
    providers: [EmployeeContextService],
    exports: [EmployeeContextService],
})
export class EmployeeContextModule {}
