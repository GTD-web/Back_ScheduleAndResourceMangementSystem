import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DomainDepartmentService } from './department.service';
import { DomainDepartmentRepository } from './department.repository';
import { Department } from '../../../libs/entities/department.entity';
import { DepartmentMicroserviceAdapter } from './adapters';

@Module({
    imports: [
        TypeOrmModule.forFeature([Department]),
        HttpModule.register({
            timeout: 10000, // 10초 타임아웃
            maxRedirects: 5,
        }),
        ConfigModule,
    ],
    providers: [DomainDepartmentService, DomainDepartmentRepository, DepartmentMicroserviceAdapter],
    exports: [DomainDepartmentService, DepartmentMicroserviceAdapter],
})
export class DomainDepartmentModule {}
