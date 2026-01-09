import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AttendanceDataContextService } from './attendance-data-context.service';
import { COMMAND_HANDLERS } from './handlers';
import { DomainHolidayInfoModule } from '../../domain/holiday-info/holiday-info.module';
import { DomainUsedAttendanceModule } from '../../domain/used-attendance/used-attendance.module';
import { DomainEventInfoModule } from '../../domain/event-info/event-info.module';
import { DomainDailyEventSummaryModule } from '../../domain/daily-event-summary/daily-event-summary.module';
import { DomainMonthlyEventSummaryModule } from '../../domain/monthly-event-summary/monthly-event-summary.module';
import { DomainAttendanceIssueModule } from '../../domain/attendance-issue/attendance-issue.module';
import { DomainEmployeeModule } from '@libs/modules/employee/employee.module';
import { WorkTimePolicyService } from './services/work-time-policy.service';

/**
 * 출입/근태 데이터 가공 Context Module
 *
 * CQRS 패턴을 사용하여 Command/Query Handler를 등록합니다.
 */
@Module({
    imports: [
        CqrsModule, // CommandBus/QueryBus 제공
        DomainHolidayInfoModule,
        DomainUsedAttendanceModule,
        DomainEventInfoModule,
        DomainDailyEventSummaryModule,
        DomainMonthlyEventSummaryModule,
        DomainAttendanceIssueModule,
        DomainEmployeeModule,
    ],
    providers: [
        AttendanceDataContextService,
        WorkTimePolicyService,
        ...COMMAND_HANDLERS, // Command Handler 등록
    ],
    exports: [AttendanceDataContextService],
})
export class AttendanceDataContextModule {}
