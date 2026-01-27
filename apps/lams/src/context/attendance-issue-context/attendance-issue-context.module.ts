import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AttendanceIssueContextService } from './attendance-issue-context.service';
import { COMMAND_HANDLERS, QUERY_HANDLERS } from './handlers';
import { DomainAttendanceIssueModule } from '../../domain/attendance-issue/attendance-issue.module';
import { DomainEmployeeDepartmentPositionHistoryModule } from '@libs/modules/employee-department-position-history/employee-department-position-history.module';

/**
 * 근태 이슈 Context Module
 *
 * CQRS 패턴을 사용하여 Command/Query Handler를 등록합니다.
 */
@Module({
    imports: [
        CqrsModule, // CommandBus/QueryBus 제공
        DomainAttendanceIssueModule,
        DomainEmployeeDepartmentPositionHistoryModule, // 부서별 직원 조회를 위해 필요
    ],
    providers: [
        AttendanceIssueContextService,
        ...COMMAND_HANDLERS, // Command Handler 등록
        ...QUERY_HANDLERS, // Query Handler 등록
    ],
    exports: [AttendanceIssueContextService],
})
export class AttendanceIssueContextModule {}
