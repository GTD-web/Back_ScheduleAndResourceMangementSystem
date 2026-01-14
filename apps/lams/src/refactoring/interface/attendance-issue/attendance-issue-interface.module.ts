import { Module } from '@nestjs/common';
import { AttendanceIssueController } from './attendance-issue.controller';
import { AttendanceIssueBusinessModule } from '../../business/attendance-issue-business/attendance-issue-business.module';

/**
 * 근태 이슈 인터페이스 모듈
 *
 * 근태 이슈 관련 API 엔드포인트를 제공합니다.
 */
@Module({
    imports: [AttendanceIssueBusinessModule],
    controllers: [AttendanceIssueController],
    providers: [],
    exports: [],
})
export class AttendanceIssueInterfaceModule {}
