import { DailyEventSummary } from '../../src/refactoring/domain/daily-event-summary/daily-event-summary.entity';

describe('DailyEventSummary 단위 테스트', () => {
    const employeeId = '11111111-1111-1111-1111-111111111111';
    const monthlySummaryId = '22222222-2222-2222-2222-222222222222';

    it('생성 시 기본값과 입력값이 설정된다', () => {
        const summary = new DailyEventSummary('2025-11-01', employeeId, monthlySummaryId, false);

        expect(summary.date).toBe('2025-11-01');
        expect(summary.employee_id).toBe(employeeId);
        expect(summary.monthly_event_summary_id).toBe(monthlySummaryId);
        expect(summary.is_holiday).toBe(false);
        expect(summary.is_checked).toBe(true);
    });

    it('UUID 형식이 잘못되면 오류가 발생한다', () => {
        expect(() => new DailyEventSummary('2025-11-01', 'invalid-uuid')).toThrow(
            'employee_id은(는) 유효한 UUID 형식이어야 합니다: invalid-uuid',
        );
        expect(() => new DailyEventSummary('2025-11-01', employeeId, 'invalid-uuid')).toThrow(
            'monthly_event_summary_id은(는) 유효한 UUID 형식이어야 합니다: invalid-uuid',
        );
    });

    it('업데이트 시 전달된 값이 반영된다', () => {
        const summary = new DailyEventSummary('2025-11-01', employeeId);

        summary.업데이트한다(monthlySummaryId, true, '09:00:00', '18:00:00', undefined, undefined, false);

        expect(summary.monthly_event_summary_id).toBe(monthlySummaryId);
        expect(summary.is_holiday).toBe(true);
        expect(summary.enter).toBe('09:00:00');
        expect(summary.leave).toBe('18:00:00');
        expect(summary.is_checked).toBe(false);
    });

    it('이벤트시간입력한다 호출 시 상태가 초기화된다', () => {
        const summary = new DailyEventSummary('2025-11-01', employeeId, undefined, true, '', '');

        summary.이벤트시간입력한다('09:10:00', '18:05:00');

        expect(summary.enter).toBe('09:10:00');
        expect(summary.leave).toBe('18:05:00');
        expect(summary.real_enter).toBe('09:10:00');
        expect(summary.real_leave).toBe('18:05:00');
        expect(summary.is_absent).toBe(false);
        expect(summary.is_late).toBe(false);
        expect(summary.is_early_leave).toBe(false);
        expect(summary.is_checked).toBe(true);
        expect(summary.note).toBe('');
    });

    it('이벤트시간초기화한다 호출 시 시간이 초기화된다', () => {
        const summary = new DailyEventSummary('2025-11-01', employeeId, undefined, false, '09:00:00', '18:00:00');

        summary.이벤트시간초기화한다();

        expect(summary.enter).toBe('');
        expect(summary.leave).toBe('');
        expect(summary.real_enter).toBe('');
        expect(summary.real_leave).toBe('');
        expect(summary.is_checked).toBe(true);
    });

    it('DTO변환 시 주요 필드가 포함된다', () => {
        const summary = new DailyEventSummary('2025-11-01', employeeId, monthlySummaryId);
        const dto = summary.DTO변환한다();

        expect(dto.date).toBe('2025-11-01');
        expect(dto.employeeId).toBe(employeeId);
        expect(dto.monthlyEventSummaryId).toBe(monthlySummaryId);
    });
});
