import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainAttendanceTypeService } from './attendance-type.service';
import { DomainAttendanceTypeRepository } from './attendance-type.repository';
import { AttendanceType } from './attendance-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AttendanceType])],
    providers: [DomainAttendanceTypeService, DomainAttendanceTypeRepository],
    exports: [DomainAttendanceTypeService],
})
export class DomainAttendanceTypeModule {}

