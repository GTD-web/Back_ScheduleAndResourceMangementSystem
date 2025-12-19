import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DomainEmployeeService } from './employee.service';
import { DomainEmployeeRepository } from './employee.repository';
import { Employee } from '../../../libs/entities/employee.entity';
import { EmployeeMicroserviceAdapter } from './adapters';

@Module({
    imports: [
        TypeOrmModule.forFeature([Employee]),
        HttpModule.register({
            timeout: 10000, // 10초 타임아웃
            maxRedirects: 5,
        }),
        ConfigModule,
    ],
    providers: [DomainEmployeeService, DomainEmployeeRepository, EmployeeMicroserviceAdapter],
    exports: [DomainEmployeeService, EmployeeMicroserviceAdapter],
})
export class DomainEmployeeModule {}
