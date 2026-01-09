/**
 * 근태 이슈 관련 타입 정의
 */

/**
 * 근태 이슈 상태
 */
export enum AttendanceIssueStatus {
    PENDING = 'pending', // 대기 (발행됨)
    CONFIRMED = 'confirmed', // 확인됨
    RESOLVED = 'resolved', // 해결됨 (수정 완료)
    REJECTED = 'rejected', // 거부됨
}

/**
 * 근태 이슈 생성 데이터
 */
export interface CreateAttendanceIssueData {
    employeeId: string;
    dailyEventSummaryId?: string;
    date: string;
    problematicEnterTime?: string;
    problematicLeaveTime?: string;
    correctedEnterTime?: string;
    correctedLeaveTime?: string;
    problematicAttendanceTypeId?: string;
    correctedAttendanceTypeId?: string;
    description?: string;
}

/**
 * 근태 이슈 업데이트 데이터
 */
export interface UpdateAttendanceIssueData {
    problematicEnterTime?: string;
    problematicLeaveTime?: string;
    correctedEnterTime?: string;
    correctedLeaveTime?: string;
    problematicAttendanceTypeId?: string;
    correctedAttendanceTypeId?: string;
    description?: string;
    status?: AttendanceIssueStatus;
    rejectionReason?: string;
}

/**
 * 근태 이슈 DTO
 */
export interface AttendanceIssueDTO {
    id: string;
    employeeId: string;
    dailyEventSummaryId: string | null;
    date: string;
    problematicEnterTime: string | null;
    problematicLeaveTime: string | null;
    correctedEnterTime: string | null;
    correctedLeaveTime: string | null;
    problematicAttendanceTypeId: string | null;
    correctedAttendanceTypeId: string | null;
    status: AttendanceIssueStatus;
    description: string | null;
    confirmedBy: string | null;
    confirmedAt: Date | null;
    resolvedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

