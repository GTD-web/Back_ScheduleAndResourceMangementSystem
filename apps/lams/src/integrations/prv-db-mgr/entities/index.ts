import { EmployeeInfoEntity } from './employee-info.entity';
import { DailyEventSummaryEntity } from './daily-event-summary.entity';
import { EventInfoEntity } from './event-info.entity';
import { MonthlyEmployeeAttendanceInfoEntity } from './monthly-event-summary.entity';
import { FileEntity } from './file.entity';
import { AttendanceTypeEntity } from './attendance-type.entity';
import { UsedAttendanceEntity } from './used-attendance.entity';
import { DepartmentInfoEntity } from './department-info.entity';
import { HolidayInfoEntity } from './holiday-info.entity';
import { EmployeeAnnualLeaveEntity } from './employee-annual-leave.entity';
import { DataSnapshotInfoEntity } from './data-snapshot-info.entity';
import { SystemVariableInfoEntity } from './system-variable-info.entity';
import { DataSnapshotChildInfoEntity } from './data-snapshot-child.entity';
import { UserEntity } from './user/user.entity';
import { ApprovalRequestBaseInfoEntity } from './approval/approval-request-info.entity';
import { ApprovalStepInfoEntity } from './approval/approval-step-info.entity';
import { ApprovalHistoryInfoEntity } from './approval/approval-history-info.entity';
import { BaseNotificationEntity } from './notification/base-notification.entity';
import { SnapshotApprovalNotificationEntity } from './notification/approval-notification.entity';
import { DataSnapshotApprovalRequestInfoEntity } from './approval/data-snapshot-approval-request-info.entity';
import { LrimUserEntity } from './user/lrim-user.entity';
import { LamsUserEntity } from './user/lams-user.entity';
import { OrganizationChartInfoEntity } from './organization-chart-info.entity';
import { DepartmentEmployeeEntity } from './department-employee.entity';
import { ExcelImportProcessEntity } from './excel-import-process.entity';

export const EntityList = {
    EventInfoEntity,
    FileEntity,
    AttendanceTypeEntity,
    MonthlyEmployeeAttendanceInfoEntity,
    EmployeeInfoEntity,
    DailyEventSummaryEntity,
    UsedAttendanceEntity,
    DepartmentInfoEntity,
    HolidayInfoEntity,
    EmployeeAnnualLeaveEntity,
    DataSnapshotInfoEntity,
    SystemVariableInfoEntity,
    DataSnapshotChildInfoEntity,
    ApprovalRequestBaseInfoEntity,
    ApprovalStepInfoEntity,
    ApprovalHistoryInfoEntity,
    DataSnapshotApprovalRequestInfoEntity,
    BaseNotificationEntity,
    SnapshotApprovalNotificationEntity,
    UserEntity,
    LamsUserEntity,
    LrimUserEntity,
    OrganizationChartInfoEntity,
    DepartmentEmployeeEntity,
    ExcelImportProcessEntity,
};
