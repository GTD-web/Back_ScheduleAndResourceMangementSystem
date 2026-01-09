import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEmployeeDepartmentPositionService } from './employee-department-position.service';
import { DomainEmployeeDepartmentPositionRepository } from './employee-department-position.repository';
import { EmployeeDepartmentPosition } from './employee-department-position.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EmployeeDepartmentPosition])],
    providers: [DomainEmployeeDepartmentPositionService, DomainEmployeeDepartmentPositionRepository],
    exports: [DomainEmployeeDepartmentPositionService],
})
export class DomainEmployeeDepartmentPositionModule {}
