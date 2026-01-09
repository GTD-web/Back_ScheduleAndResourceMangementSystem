import { Injectable, Logger } from '@nestjs/common';
import { DomainHolidayInfoService } from '../../domain/holiday-info/holiday-info.service';
import { HolidayInfo } from '../../domain/holiday-info/holiday-info.entity';

/**
 * 휴일 정보 컨텍스트
 * - 도메인 서비스를 조합하여 휴일 정보 관련 비즈니스 로직 처리
 */
@Injectable()
export class HolidayInfoContext {
    private readonly logger = new Logger(HolidayInfoContext.name);

    constructor(private readonly domainHolidayInfoService: DomainHolidayInfoService) {}

    /**
     * 모든 휴일 정보 조회
     * @returns 휴일 정보 목록
     */
    async getAllHolidays(): Promise<HolidayInfo[]> {
        this.logger.log('모든 휴일 정보 조회 시작');
        const holidays = await this.domainHolidayInfoService.findAll();
        this.logger.log(`휴일 ${holidays.length}개 조회 완료`);
        return holidays;
    }

    /**
     * 특정 연도의 휴일 조회
     * @param year - 연도 (YYYY)
     * @returns 해당 연도의 휴일 목록
     */
    async getHolidaysByYear(year: string): Promise<HolidayInfo[]> {
        this.logger.log(`${year}년 휴일 조회 시작`);
        const holidays = await this.domainHolidayInfoService
            .createQueryBuilder('holiday')
            .where('holiday.holidayDate LIKE :year', { year: `${year}%` })
            .orderBy('holiday.holidayDate', 'ASC')
            .getMany();
        this.logger.log(`${year}년 휴일 ${holidays.length}개 조회 완료`);
        return holidays;
    }

    /**
     * 특정 연월의 휴일 조회
     * @param year - 연도 (YYYY)
     * @param month - 월 (MM)
     * @returns 해당 연월의 휴일 목록
     */
    async getHolidaysByYearMonth(year: string, month: string): Promise<HolidayInfo[]> {
        const yearMonth = `${year}-${month.padStart(2, '0')}`;
        this.logger.log(`${yearMonth} 휴일 조회 시작`);
        const holidays = await this.domainHolidayInfoService
            .createQueryBuilder('holiday')
            .where('holiday.holidayDate LIKE :yearMonth', { yearMonth: `${yearMonth}%` })
            .orderBy('holiday.holidayDate', 'ASC')
            .getMany();
        this.logger.log(`${yearMonth} 휴일 ${holidays.length}개 조회 완료`);
        return holidays;
    }

    /**
     * ID로 휴일 정보 조회
     * @param holidayId - 휴일 ID
     * @returns 휴일 정보
     */
    async getHolidayById(holidayId: string): Promise<HolidayInfo> {
        return await this.domainHolidayInfoService.findOne({ where: { holidayId } });
    }
}
