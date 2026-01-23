import { WorkTimeOverride } from '../../src/refactoring/domain/work-time-override/work-time-override.entity';

describe('WorkTimeOverride 단위 테스트', () => {
    it('생성 시 기본값이 설정된다', () => {
        const override = new WorkTimeOverride('2025-12-01', '09:00:00', '18:00:00', '테스트');

        expect(override.date).toBe('2025-12-01');
        expect(override.start_work_time).toBe('09:00:00');
        expect(override.end_work_time).toBe('18:00:00');
        expect(override.reason).toBe('테스트');
    });

    it('날짜 형식이 올바르지 않으면 오류가 발생한다', () => {
        expect(() => new WorkTimeOverride('2025/12/01')).toThrow('날짜는 yyyy-MM-dd 형식이어야 합니다.');
    });

    it('시간 형식이 올바르지 않으면 오류가 발생한다', () => {
        expect(() => new WorkTimeOverride('2025-12-01', '9:00:00', '18:00:00')).toThrow(
            '시작 시간은 HH:MM:SS 형식이어야 합니다.',
        );
        expect(() => new WorkTimeOverride('2025-12-01', '09:00:00', '6:00:00')).toThrow(
            '종료 시간은 HH:MM:SS 형식이어야 합니다.',
        );
    });

    it('시작 시간이 종료 시간보다 같거나 늦으면 오류가 발생한다', () => {
        expect(() => new WorkTimeOverride('2025-12-01', '18:00:00', '18:00:00')).toThrow(
            '시작 시간은 종료 시간보다 이전이어야 합니다.',
        );
    });

    it('업데이트 시 전달된 값이 반영된다', () => {
        const override = new WorkTimeOverride('2025-12-01', '09:00:00', '18:00:00', '테스트');

        override.업데이트한다('10:00:00', '19:00:00', '수정');

        expect(override.start_work_time).toBe('10:00:00');
        expect(override.end_work_time).toBe('19:00:00');
        expect(override.reason).toBe('수정');
    });

    it('DTO변환 시 주요 필드가 포함된다', () => {
        const override = new WorkTimeOverride('2025-12-01', '09:00:00', '18:00:00');
        const dto = override.DTO변환한다();

        expect(dto.date).toBe('2025-12-01');
        expect(dto.startWorkTime).toBe('09:00:00');
        expect(dto.endWorkTime).toBe('18:00:00');
    });
});
