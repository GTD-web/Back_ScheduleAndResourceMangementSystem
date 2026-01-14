import { GetAttendanceIssuesHandler, GetAttendanceIssueHandler } from './attendance-issue/queries';
import {
    UpdateAttendanceIssueDescriptionHandler,
    UpdateAttendanceIssueCorrectionHandler,
    ApplyAttendanceIssueHandler,
    RejectAttendanceIssueHandler,
} from './attendance-issue/commands';

export const QUERY_HANDLERS = [GetAttendanceIssuesHandler, GetAttendanceIssueHandler];

export const COMMAND_HANDLERS = [
    UpdateAttendanceIssueDescriptionHandler,
    UpdateAttendanceIssueCorrectionHandler,
    ApplyAttendanceIssueHandler,
    RejectAttendanceIssueHandler,
];
