import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainDepartmentService } from './department.service';
import { DomainDepartmentRepository } from './department.repository';
import { Department } from './department.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Department])],
    providers: [DomainDepartmentService, DomainDepartmentRepository],
    exports: [DomainDepartmentService],
})
export class DomainDepartmentModule {}
