import { HolidayInfo } from '../../src/refactoring/domain/holiday-info/holiday-info.entity';

describe('HolidayInfo 단위 테스트', () => {
    it('생성 시 필수값이 설정된다', () => {
        const holiday = new HolidayInfo('설날', '2025-01-29');

        expect(holiday.holiday_name).toBe('설날');
        expect(holiday.holiday_date).toBe('2025-01-29');
    });

    it('필수값이 비어 있으면 오류가 발생한다', () => {
        expect(() => new HolidayInfo(' ', '2025-01-29')).toThrow('휴일명은 필수입니다.');
        expect(() => new HolidayInfo('설날', ' ')).toThrow('휴일 날짜는 필수입니다.');
    });

    it('업데이트 시 전달된 값이 반영된다', () => {
        const holiday = new HolidayInfo('설날', '2025-01-29');

        holiday.업데이트한다('설날 연휴', '2025-01-30');

        expect(holiday.holiday_name).toBe('설날 연휴');
        expect(holiday.holiday_date).toBe('2025-01-30');
    });

    it('DTO변환 시 주요 필드가 포함된다', () => {
        const holiday = new HolidayInfo('설날', '2025-01-29');
        const dto = holiday.DTO변환한다();

        expect(dto.holidayName).toBe('설날');
        expect(dto.holidayDate).toBe('2025-01-29');
    });
});
