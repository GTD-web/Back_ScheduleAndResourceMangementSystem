import { MonthlyEventSummary } from '../../src/refactoring/domain/monthly-event-summary/monthly-event-summary.entity';

describe('MonthlyEventSummary 단위 테스트', () => {
    const employeeId = '11111111-1111-1111-1111-111111111111';

    it('생성 시 필수값이 설정된다', () => {
        const summary = new MonthlyEventSummary('EMP001', employeeId, '2025-11', 20, 9600, 480, {
            WORK: 20,
        });

        expect(summary.employee_number).toBe('EMP001');
        expect(summary.employee_id).toBe(employeeId);
        expect(summary.yyyymm).toBe('2025-11');
        expect(summary.work_days_count).toBe(20);
        expect(summary.total_work_time).toBe(9600);
    });

    it('필수값이 비어 있으면 오류가 발생한다', () => {
        expect(() => new MonthlyEventSummary('', employeeId, '2025-11', 1, 1, 1, {})).toThrow(
            '사원 번호는 필수입니다.',
        );
        expect(() => new MonthlyEventSummary('EMP001', employeeId, '', 1, 1, 1, {})).toThrow('연월은 필수입니다.');
    });

    it('근무 일수/근무 시간이 음수면 오류가 발생한다', () => {
        expect(() => new MonthlyEventSummary('EMP001', employeeId, '2025-11', -1, 1, 1, {})).toThrow(
            '근무 일수는 0 이상이어야 합니다.',
        );
        expect(() => new MonthlyEventSummary('EMP001', employeeId, '2025-11', 1, -1, 1, {})).toThrow(
            '총 근무 시간은 0 이상이어야 합니다.',
        );
    });

    it('업데이트 시 전달된 값이 반영된다', () => {
        const summary = new MonthlyEventSummary('EMP001', employeeId, '2025-11', 20, 9600, 480, {
            WORK: 20,
        });

        summary.업데이트한다(
            'EMP002',
            '홍길동',
            21,
            10000,
            10000,
            500,
            { WORK: 21 },
            [],
            [],
            [],
            [],
            [],
            'note',
            'add',
        );

        expect(summary.employee_number).toBe('EMP002');
        expect(summary.employee_name).toBe('홍길동');
        expect(summary.work_days_count).toBe(21);
        expect(summary.total_work_time).toBe(10000);
        expect(summary.additional_note).toBe('add');
    });

    it('요약업데이트한다 호출 시 요약 정보가 갱신된다', () => {
        const summary = new MonthlyEventSummary('EMP001', employeeId, '2025-11', 20, 9600, 480, {
            WORK: 20,
        });

        summary.요약업데이트한다({
            employeeInfo: { employeeNumber: 'EMP010', employeeId, employeeName: '테스트' },
            yyyymm: '2025-12',
            totalWorkableTime: 11000,
            totalWorkTime: 10000,
            workDaysCount: 22,
            avgWorkTimes: 455,
            attendanceTypeCount: { WORK: 22 },
            weeklyWorkTimeSummary: [],
            dailyEventSummary: [],
            lateDetails: [],
            absenceDetails: [],
            earlyLeaveDetails: [],
            note: '요약 업데이트',
        });

        expect(summary.employee_number).toBe('EMP010');
        expect(summary.employee_name).toBe('테스트');
        expect(summary.yyyymm).toBe('2025-12');
        expect(summary.note).toBe('요약 업데이트');
    });

    it('DTO변환 시 주요 필드가 포함된다', () => {
        const summary = new MonthlyEventSummary('EMP001', employeeId, '2025-11', 20, 9600, 480, {
            WORK: 20,
        });
        const dto = summary.DTO변환한다();

        expect(dto.employeeNumber).toBe('EMP001');
        expect(dto.employeeId).toBe(employeeId);
        expect(dto.yyyymm).toBe('2025-11');
    });
});
