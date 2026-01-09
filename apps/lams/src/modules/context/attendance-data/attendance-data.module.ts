import { Module } from '@nestjs/common';
import { AttendanceDataContext } from './attendance-data.context';
import { FileManagementModule } from '../file-management/file-management.module';
import { DomainEmployeeModule } from '../../domain/employee/employee.module';
import { DomainAttendanceTypeModule } from '../../domain/attendance-type/attendance-type.module';
import { DomainHolidayInfoModule } from '../../domain/holiday-info/holiday-info.module';
import { DomainUsedAttendanceModule } from '../../domain/used-attendance/used-attendance.module';
import { DomainEventInfoModule } from '../../domain/event-info/event-info.module';
import { DomainDailyEventSummaryModule } from '../../domain/daily-event-summary/daily-event-summary.module';

@Module({
    imports: [
        FileManagementModule,
        DomainEmployeeModule,
        DomainAttendanceTypeModule,
        DomainHolidayInfoModule,
        DomainUsedAttendanceModule,
        DomainEventInfoModule,
        DomainDailyEventSummaryModule,
    ],
    providers: [AttendanceDataContext],
    exports: [AttendanceDataContext],
})
export class AttendanceDataModule {}

