import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainUsedAttendanceService } from './used-attendance.service';
import { DomainUsedAttendanceRepository } from './used-attendance.repository';
import { UsedAttendance } from './used-attendance.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UsedAttendance])],
    providers: [DomainUsedAttendanceService, DomainUsedAttendanceRepository],
    exports: [DomainUsedAttendanceService],
})
export class DomainUsedAttendanceModule {}
