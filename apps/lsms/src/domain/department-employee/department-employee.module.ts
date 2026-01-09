import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainDepartmentEmployeeService } from './department-employee.service';
import { DomainDepartmentEmployeeRepository } from './department-employee.repository';
import { DepartmentEmployee } from './department-employee.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DepartmentEmployee])],
    providers: [DomainDepartmentEmployeeService, DomainDepartmentEmployeeRepository],
    exports: [DomainDepartmentEmployeeService],
})
export class DomainDepartmentEmployeeModule {}
