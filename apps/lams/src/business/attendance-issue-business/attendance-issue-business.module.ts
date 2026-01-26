import { Module } from '@nestjs/common';
import { AttendanceIssueBusinessService } from './attendance-issue-business.service';
import { AttendanceIssueContextModule } from '../../context/attendance-issue-context/attendance-issue-context.module';
import { AttendanceDataContextModule } from '../../context/attendance-data-context/attendance-data-context.module';

/**
 * 근태 이슈 비즈니스 모듈
 */
@Module({
    imports: [AttendanceIssueContextModule, AttendanceDataContextModule],
    providers: [AttendanceIssueBusinessService],
    exports: [AttendanceIssueBusinessService],
})
export class AttendanceIssueBusinessModule {}
