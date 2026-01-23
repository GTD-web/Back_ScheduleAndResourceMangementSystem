import { ApprovalStatus } from '../../../../domain/data-snapshot-info/data-snapshot-info.types';

/**
 * 근태 스냅샷 저장 Command 인터페이스
 */
export interface ISaveAttendanceSnapshotCommand {
    year: string;
    month: string;
    departmentId?: string;
    snapshotName?: string;
    description?: string;
    performedBy: string;
    snapshotVersion?: string; // A-Z (지정하지 않으면 자동 결정)
    approvalDocumentId?: string; // UUID
    submittedAt?: Date;
    approverName?: string;
    approvalStatus?: ApprovalStatus;
}
