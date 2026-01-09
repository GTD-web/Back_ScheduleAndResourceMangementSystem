import { Injectable, Logger } from '@nestjs/common';
import { AttendanceTypeContext } from '../../context/attendance-type';
import { HolidayInfoContext } from '../../context/holiday-info';
import { DepartmentContext } from '../../context/department';
import {
    MetadataResponseDto,
    AttendanceTypesResponseDto,
    HolidaysResponseDto,
    DepartmentsResponseDto,
} from './dto/metadata-response.dto';

/**
 * 메타데이터 비즈니스 서비스
 * - 근태 유형, 휴일 정보, 부서 정보를 조합하여 제공
 */
@Injectable()
export class MetadataService {
    private readonly logger = new Logger(MetadataService.name);

    constructor(
        private readonly attendanceTypeContext: AttendanceTypeContext,
        private readonly holidayInfoContext: HolidayInfoContext,
        private readonly departmentContext: DepartmentContext,
    ) {}

    /**
     * 모든 메타데이터 조회 (근태 유형 + 휴일 정보)
     * @param year - 연도 (선택, 휴일 필터링용)
     * @param month - 월 (선택, 휴일 필터링용)
     * @returns 메타데이터 전체
     */
    async getAllMetadata(year?: string, month?: string): Promise<MetadataResponseDto> {
        this.logger.log(`메타데이터 조회 시작 (year: ${year}, month: ${month})`);

        // 병렬로 조회
        const [attendanceTypes, holidays] = await Promise.all([
            this.attendanceTypeContext.getAllAttendanceTypes(),
            year && month
                ? this.holidayInfoContext.getHolidaysByYearMonth(year, month)
                : year
                  ? this.holidayInfoContext.getHolidaysByYear(year)
                  : this.holidayInfoContext.getAllHolidays(),
        ]);

        this.logger.log(`메타데이터 조회 완료: 근태 유형 ${attendanceTypes.length}개, 휴일 ${holidays.length}개`);

        return {
            attendanceTypes,
            holidays,
        };
    }

    /**
     * 근태 유형만 조회
     * @param recognizedOnly - 인정 근태만 조회할지 여부
     * @returns 근태 유형 목록
     */
    async getAttendanceTypes(recognizedOnly?: boolean): Promise<AttendanceTypesResponseDto> {
        this.logger.log(`근태 유형 조회 시작 (recognizedOnly: ${recognizedOnly})`);

        const attendanceTypes = recognizedOnly
            ? await this.attendanceTypeContext.getRecognizedAttendanceTypes()
            : await this.attendanceTypeContext.getAllAttendanceTypes();

        return { attendanceTypes };
    }

    /**
     * 휴일 정보만 조회
     * @param year - 연도 (선택)
     * @param month - 월 (선택)
     * @returns 휴일 정보 목록
     */
    async getHolidays(year?: string, month?: string): Promise<HolidaysResponseDto> {
        this.logger.log(`휴일 정보 조회 시작 (year: ${year}, month: ${month})`);

        const holidays =
            year && month
                ? await this.holidayInfoContext.getHolidaysByYearMonth(year, month)
                : year
                  ? await this.holidayInfoContext.getHolidaysByYear(year)
                  : await this.holidayInfoContext.getAllHolidays();

        return { holidays };
    }

    /**
     * 부서 정보 조회
     * @param includeTree - 계층 구조 포함 여부
     * @returns 부서 정보 목록
     */
    async getDepartments(): Promise<DepartmentsResponseDto> {
        const departments = await this.departmentContext.getAllDepartments();

        return { departments };
    }
}
