import { AttendanceIssue } from '../../src/refactoring/domain/attendance-issue/attendance-issue.entity';
import { AttendanceIssueStatus } from '../../src/refactoring/domain/attendance-issue/attendance-issue.types';

describe('AttendanceIssue 단위 테스트', () => {
    const employeeId = '11111111-1111-1111-1111-111111111111';
    const dailySummaryId = '22222222-2222-2222-2222-222222222222';
    const attendanceTypeIds = [
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
    ];

    it('생성 시 기본 상태와 필드가 설정된다', () => {
        const issue = new AttendanceIssue(employeeId, '2025-11-01', dailySummaryId);

        expect(issue.employee_id).toBe(employeeId);
        expect(issue.daily_event_summary_id).toBe(dailySummaryId);
        expect(issue.status).toBe(AttendanceIssueStatus.REQUEST);
        expect(issue.confirmed_by).toBeNull();
    });

    it('근태 유형 ID가 2개를 초과하면 오류가 발생한다', () => {
        expect(
            () =>
                new AttendanceIssue(employeeId, '2025-11-01', dailySummaryId, undefined, undefined, undefined, undefined, [
                    ...attendanceTypeIds,
                    '55555555-5555-5555-5555-555555555555',
                ]),
        ).toThrow('문제가 된 근태 유형 ID는 최대 2개까지 가능합니다.');
    });

    it('업데이트 시 변경된 값이 반영된다', () => {
        const issue = new AttendanceIssue(employeeId, '2025-11-01', dailySummaryId);

        issue.업데이트한다(
            '08:30:00',
            '18:10:00',
            '09:00:00',
            '18:00:00',
            attendanceTypeIds,
            undefined,
            '테스트 수정',
            AttendanceIssueStatus.NOT_APPLIED,
        );

        expect(issue.problematic_enter_time).toBe('08:30:00');
        expect(issue.corrected_enter_time).toBe('09:00:00');
        expect(issue.problematic_attendance_type_ids).toEqual(attendanceTypeIds);
        expect(issue.status).toBe(AttendanceIssueStatus.NOT_APPLIED);
    });

    it('반영처리 시 상태와 확인정보가 설정된다', () => {
        const issue = new AttendanceIssue(employeeId, '2025-11-01', dailySummaryId);

        issue.반영처리한다('관리자');

        expect(issue.status).toBe(AttendanceIssueStatus.APPLIED);
        expect(issue.confirmed_by).toBe('관리자');
        expect(issue.confirmed_at).toBeInstanceOf(Date);
        expect(issue.resolved_at).toBeInstanceOf(Date);
    });

    it('DTO변환 시 주요 필드가 포함된다', () => {
        const issue = new AttendanceIssue(employeeId, '2025-11-01', dailySummaryId);
        const dto = issue.DTO변환한다();

        expect(dto.employeeId).toBe(employeeId);
        expect(dto.dailyEventSummaryId).toBe(dailySummaryId);
        expect(dto.status).toBe(AttendanceIssueStatus.REQUEST);
    });
});
