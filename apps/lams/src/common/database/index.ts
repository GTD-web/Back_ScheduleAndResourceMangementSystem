import { Department } from '../../modules/domain/department/department.entity';
import { Rank } from '../../modules/domain/rank/rank.entity';
import { EmployeeDepartmentPosition } from '../../modules/domain/employee-department-position/employee-department-position.entity';
import { Position } from '../../modules/domain/position/position.entity';
import { Employee } from '../../modules/domain/employee/employee.entity';
import { AttendanceType } from '../../modules/domain/attendance-type/attendance-type.entity';
import { DailyEventSummary } from '../../modules/domain/daily-event-summary/daily-event-summary.entity';
import { EventInfo } from '../../modules/domain/event-info/event-info.entity';
import { MonthlyEventSummary } from '../../modules/domain/monthly-event-summary/monthly-event-summary.entity';
import { HolidayInfo } from '../../modules/domain/holiday-info/holiday-info.entity';
import { UsedAttendance } from '../../modules/domain/used-attendance/used-attendance.entity';
import { DataSnapshotInfo } from '../../modules/domain/data-snapshot-info/data-snapshot-info.entity';
import { DataSnapshotChild } from '../../modules/domain/data-snapshot-child/data-snapshot-child.entity';
import { File } from '../../modules/domain/file/file.entity';
// import { MonthlyEventSummaryView } from '../../modules/domain/monthly-event-summary-view/monthly-event-summary-view.entity';

export const Entities = [
    Department,
    Rank,
    EmployeeDepartmentPosition,
    Position,
    Employee,
    AttendanceType,
    DailyEventSummary,
    EventInfo,
    MonthlyEventSummary,
    HolidayInfo,
    UsedAttendance,
    DataSnapshotInfo,
    DataSnapshotChild,
    File,
    // MonthlyEventSummaryView,
];
