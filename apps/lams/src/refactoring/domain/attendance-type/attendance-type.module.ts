import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceType } from './attendance-type.entity';
import { DomainAttendanceTypeService } from './attendance-type.service';

/**
 * 출석 타입 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([AttendanceType])],
    providers: [DomainAttendanceTypeService],
    exports: [DomainAttendanceTypeService, TypeOrmModule],
})
export class DomainAttendanceTypeModule {}

