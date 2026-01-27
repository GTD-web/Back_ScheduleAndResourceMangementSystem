import { GetDepartmentMonthlyAverageWorkHoursHandler } from './queries/get-department-monthly-average-work-hours.handler';
import { GetDepartmentMonthlyEmployeeAttendanceHandler } from './queries/get-department-monthly-employee-attendance.handler';
import { GetDepartmentWeeklyTopEmployeesHandler } from './queries/get-department-weekly-top-employees.handler';
import { GetDepartmentSnapshotsHandler } from './queries/get-department-snapshots.handler';
import { GetEmployeeAttendanceDetailHandler } from './queries/get-employee-attendance-detail.handler';

export const QUERY_HANDLERS = [
    GetDepartmentMonthlyAverageWorkHoursHandler,
    GetDepartmentMonthlyEmployeeAttendanceHandler,
    GetDepartmentWeeklyTopEmployeesHandler,
    GetDepartmentSnapshotsHandler,
    GetEmployeeAttendanceDetailHandler,
];

export * from './queries';
