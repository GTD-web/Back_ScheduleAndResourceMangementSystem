import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEmployeeDepartmentPositionService } from './employee-department-position.service';
import { EmployeeDepartmentPosition } from './employee-department-position.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EmployeeDepartmentPosition])],
    providers: [DomainEmployeeDepartmentPositionService],
    exports: [DomainEmployeeDepartmentPositionService],
})
export class DomainEmployeeDepartmentPositionModule {}
