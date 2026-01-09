import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsedAttendance } from './used-attendance.entity';
import { DomainUsedAttendanceService } from './used-attendance.service';
import { DomainAttendanceTypeModule } from '../attendance-type/attendance-type.module';

/**
 * 사용된 근태 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([UsedAttendance]), DomainAttendanceTypeModule],
    providers: [DomainUsedAttendanceService],
    exports: [DomainUsedAttendanceService, TypeOrmModule],
})
export class DomainUsedAttendanceModule {}
