import { Controller, Get, Post, Param, Query, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MonthlySummaryService } from './monthly-summary.service';

@ApiTags('월간 근태 요약')
@Controller('monthly-summary')
export class MonthlySummaryController {
    constructor(private readonly monthlySummaryService: MonthlySummaryService) {}

    @Get(':yyyymm')
    @ApiOperation({
        summary: '특정 연월의 모든 직원 월간 요약 조회',
        description:
            '특정 연월에 대한 모든 직원의 월간 근태 요약을 생성하면서 조회합니다. departmentId로 특정 부서의 직원만 필터링할 수 있습니다.',
    })
    @ApiParam({
        name: 'yyyymm',
        description: '연월 (YYYY-MM 형식)',
        example: '2025-10',
    })
    @ApiQuery({
        name: 'departmentId',
        required: false,
        type: String,
        description: '부서 ID (선택, 특정 부서의 직원만 조회)',
        example: 'uuid-department-id',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '조회 성공',
    })
    async getMonthlySummariesByYearMonth(
        @Param('yyyymm') yyyymm: string,
        @Query('departmentId') departmentId?: string,
    ) {
        const summaries = await this.monthlySummaryService.generateMonthlySummariesForAllEmployees(
            yyyymm,
            departmentId,
        );

        return {
            summaries,
        };
    }
}
