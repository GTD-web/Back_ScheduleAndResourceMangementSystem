import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEmployeeService } from './employee.service';
import { Employee } from './employee.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Employee])],
    providers: [DomainEmployeeService],
    exports: [DomainEmployeeService],
})
export class DomainEmployeeModule {}
