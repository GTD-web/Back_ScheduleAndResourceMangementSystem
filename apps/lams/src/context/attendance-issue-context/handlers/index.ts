import {
    GetAttendanceIssuesHandler,
    GetAttendanceIssueHandler,
    GetAttendanceIssuesByDepartmentHandler,
} from './attendance-issue/queries';
import {
    UpdateAttendanceIssueDescriptionHandler,
    UpdateAttendanceIssueCorrectionHandler,
    ApplyAttendanceIssueHandler,
    RejectAttendanceIssueHandler,
    ReRequestAttendanceIssueHandler,
} from './attendance-issue/commands';

export const QUERY_HANDLERS = [
    GetAttendanceIssuesHandler,
    GetAttendanceIssueHandler,
    GetAttendanceIssuesByDepartmentHandler,
];

export const COMMAND_HANDLERS = [
    UpdateAttendanceIssueDescriptionHandler,
    UpdateAttendanceIssueCorrectionHandler,
    ApplyAttendanceIssueHandler,
    RejectAttendanceIssueHandler,
    ReRequestAttendanceIssueHandler,
];
