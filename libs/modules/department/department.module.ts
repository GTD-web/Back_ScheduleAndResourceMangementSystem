import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainDepartmentService } from './department.service';
import { Department } from './department.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Department])],
    providers: [DomainDepartmentService],
    exports: [DomainDepartmentService],
})
export class DomainDepartmentModule {}
