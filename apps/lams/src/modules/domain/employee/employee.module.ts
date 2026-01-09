import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEmployeeService } from './employee.service';
import { DomainEmployeeRepository } from './employee.repository';
import { Employee } from './employee.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Employee])],
    providers: [DomainEmployeeService, DomainEmployeeRepository],
    exports: [DomainEmployeeService, DomainEmployeeRepository],
})
export class DomainEmployeeModule {}
