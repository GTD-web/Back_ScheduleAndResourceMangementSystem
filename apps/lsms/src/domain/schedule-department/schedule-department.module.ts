import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleDepartment } from './schedule-department.entity';
import { ScheduleDepartmentRepository } from './schedule-department.repository';
import { DomainScheduleDepartmentService } from './schedule-department.service';

@Module({
    imports: [TypeOrmModule.forFeature([ScheduleDepartment])],
    providers: [ScheduleDepartmentRepository, DomainScheduleDepartmentService],
    exports: [DomainScheduleDepartmentService],
})
export class DomainScheduleDepartmentModule {}
