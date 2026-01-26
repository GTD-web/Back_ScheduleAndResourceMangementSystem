import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceIssue } from './attendance-issue.entity';
import { DomainAttendanceIssueService } from './attendance-issue.service';

/**
 * 근태 이슈 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([AttendanceIssue])],
    providers: [DomainAttendanceIssueService],
    exports: [DomainAttendanceIssueService, TypeOrmModule],
})
export class DomainAttendanceIssueModule {}

