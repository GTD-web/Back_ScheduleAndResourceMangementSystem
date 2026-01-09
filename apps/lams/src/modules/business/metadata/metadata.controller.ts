import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MetadataService } from './metadata.service';
import {
    MetadataResponseDto,
    AttendanceTypesResponseDto,
    HolidaysResponseDto,
    DepartmentsResponseDto,
} from './dto/metadata-response.dto';

/**
 * 메타데이터 컨트롤러
 * - 근태 유형, 휴일 정보, 부서 정보 등 메타데이터 조회 API 제공
 */
@ApiTags('Metadata')
@Controller('metadata')
export class MetadataController {
    constructor(private readonly metadataService: MetadataService) {}

    /**
     * 모든 메타데이터 조회 (근태 유형 + 휴일 정보)
     * @param year - 연도 (선택, 휴일 필터링용)
     * @param month - 월 (선택, 휴일 필터링용)
     * @returns 메타데이터 전체
     */
    @Get()
    @ApiOperation({
        summary: '모든 메타데이터 조회',
        description: '근태 유형과 휴일 정보를 한번에 조회합니다. year, month 쿼리로 휴일을 필터링할 수 있습니다.',
    })
    @ApiQuery({
        name: 'year',
        required: false,
        type: String,
        description: '연도 (YYYY 형식, 휴일 필터링용)',
        example: '2025',
    })
    @ApiQuery({
        name: 'month',
        required: false,
        type: String,
        description: '월 (MM 형식, 휴일 필터링용)',
        example: '10',
    })
    @ApiResponse({
        status: 200,
        description: '메타데이터 조회 성공',
        type: MetadataResponseDto,
    })
    async getAllMetadata(@Query('year') year?: string, @Query('month') month?: string): Promise<MetadataResponseDto> {
        return await this.metadataService.getAllMetadata(year, month);
    }

    /**
     * 근태 유형만 조회
     * @param recognizedOnly - 인정 근태만 조회할지 여부
     * @returns 근태 유형 목록
     */
    @Get('attendance-types')
    @ApiOperation({
        summary: '근태 유형 조회',
        description: '근태 유형 목록을 조회합니다. recognizedOnly=true로 근무 인정 근태만 필터링할 수 있습니다.',
    })
    @ApiQuery({
        name: 'recognizedOnly',
        required: false,
        type: Boolean,
        description: '근무 시간 인정 근태만 조회 (true/false)',
        example: false,
    })
    @ApiResponse({
        status: 200,
        description: '근태 유형 조회 성공',
        type: AttendanceTypesResponseDto,
    })
    async getAttendanceTypes(@Query('recognizedOnly') recognizedOnly?: string): Promise<AttendanceTypesResponseDto> {
        const recognized = recognizedOnly === 'true';
        return await this.metadataService.getAttendanceTypes(recognized);
    }

    /**
     * 휴일 정보만 조회
     * @param year - 연도 (선택)
     * @param month - 월 (선택)
     * @returns 휴일 정보 목록
     */
    @Get('holidays')
    @ApiOperation({
        summary: '휴일 정보 조회',
        description: '휴일 정보 목록을 조회합니다. year, month 쿼리로 필터링할 수 있습니다.',
    })
    @ApiQuery({
        name: 'year',
        required: false,
        type: String,
        description: '연도 (YYYY 형식)',
        example: '2025',
    })
    @ApiQuery({
        name: 'month',
        required: false,
        type: String,
        description: '월 (MM 형식)',
        example: '10',
    })
    @ApiResponse({
        status: 200,
        description: '휴일 정보 조회 성공',
        type: HolidaysResponseDto,
    })
    async getHolidays(@Query('year') year?: string, @Query('month') month?: string): Promise<HolidaysResponseDto> {
        return await this.metadataService.getHolidays(year, month);
    }

    /**
     *
     * 부서 정보 조회
     * @param includeTree - 계층 구조 포함 여부
     * @returns 부서 정보 목록
     */
    @Get('departments')
    @ApiOperation({
        summary: '부서 정보 조회',
        description: '부서 정보 목록을 조회합니다. includeTree=true로 계층 구조를 포함할 수 있습니다.',
    })
    @ApiResponse({
        status: 200,
        description: '부서 정보 조회 성공',
        type: DepartmentsResponseDto,
    })
    async getDepartments(): Promise<DepartmentsResponseDto> {
        return await this.metadataService.getDepartments();
    }
}
