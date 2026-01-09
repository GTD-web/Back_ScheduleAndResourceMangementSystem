import { Controller, Post, Delete, UseInterceptors, UploadedFiles, Body, HttpStatus, Query } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AttendanceExcelManagementService } from './attendance-excel-management.service';

/**
 * 근태 관련 엑셀 파일 관리 컨트롤러
 *
 * 출입 이벤트 및 근태 사용 내역 엑셀 파일을 업로드하고 데이터를 가공하여 저장합니다.
 */
@ApiTags('근태 엑셀 관리')
@Controller('api/attendance-excel')
export class AttendanceExcelManagementController {
    constructor(private readonly attendanceExcelManagementService: AttendanceExcelManagementService) {}

    /**
     * 근태/출입 엑셀 파일 일괄 업로드
     *
     * 여러 개의 엑셀 파일을 한 번에 업로드하고 자동으로 처리합니다.
     * 파일명에 '출입' 또는 '근태'가 포함되어야 하며, 파일명 순서대로 처리됩니다.
     */
    @Post('upload')
    @ApiOperation({
        summary: '근태/출입 엑셀 일괄 업로드',
        description: `
여러 개의 엑셀 파일을 한 번에 업로드하고 자동으로 처리합니다.

**파일명 규칙:**
- 출입 이벤트 파일: 파일명에 "출입" 포함 (예: "11월_출입이력.xlsx")
- 근태 사용 파일: 파일명에 "근태" 포함 (예: "11월_근태사용내역.xlsx")

**처리 과정:**
1. 파일명 유효성 검증 ("출입" 또는 "근태" 포함 여부)
2. 파일명으로 정렬 (알파벳/가나다 순)
3. 각 파일을 순서대로 처리:
   - 출입 파일: event_info + daily_event_summaries 저장
   - 근태 파일: used_attendance 저장
4. 일일 요약 생성
5. (선택) 월간 요약 생성
6. 전체 처리 결과 반환

**파일 제한:**
- 최대 10개 파일
- 각 파일은 xlsx, xls 형식

**엑셀 파일 형식:**

[출입 이벤트]
- 필수 컬럼: 위치, 발생시각, 장치명, 상태, 이름, 사원번호, 조직

[근태 사용 내역]
- 필수 컬럼: ERP사번, 이름, 부서, 기간, 신청일수, 근태구분
- 기간 형식: "2025-01-01 ~ 2025-01-03"
        `,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['files', 'uploadBy', 'year', 'month'],
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: '엑셀 파일 목록 (최대 10개)',
                },
                uploadBy: {
                    type: 'string',
                    description: '업로더 ID (UUID)',
                    example: '839e6f06-8d44-43a1-948c-095253c4cf8c',
                },
                year: {
                    type: 'string',
                    description: '연도 (YYYY)',
                    example: '2024',
                },
                month: {
                    type: 'string',
                    description: '월 (MM)',
                    example: '11',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '업로드 및 처리 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                totalFiles: { type: 'number', example: 3 },
                processedFiles: { type: 'number', example: 3 },
                results: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            fileName: { type: 'string', example: '11월_출입이력.xlsx' },
                            type: { type: 'string', example: 'event' },
                            success: { type: 'boolean', example: true },
                            fileId: { type: 'string', example: 'uuid' },
                            statistics: { type: 'object' },
                            error: { type: 'string' },
                        },
                    },
                },
                summaryResults: {
                    type: 'array',
                    description: '일일 요약 생성 결과',
                },
                monthlySummaryResults: {
                    type: 'object',
                    nullable: true,
                    description: '월간 요약 생성 결과 (generateMonthlySummary=true인 경우)',
                    properties: {
                        yearMonth: { type: 'string', example: '2024-11' },
                        success: { type: 'boolean', example: true },
                        count: { type: 'number', example: 79 },
                        elapsedTime: { type: 'number', example: 6764 },
                        elapsedTimeSeconds: { type: 'number', example: 6.76 },
                    },
                },
                performance: {
                    type: 'object',
                    properties: {
                        totalTime: { type: 'number', example: 15000 },
                        totalTimeSeconds: { type: 'number', example: 15.0 },
                    },
                },
            },
        },
    })
    @ApiQuery({
        name: 'generateMonthlySummary',
        required: false,
        type: Boolean,
        description: '월간 요약 생성 여부 (true: 생성, false: 생성 안함)',
        example: false,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '파일이 없거나 파일명에 "출입" 또는 "근태"가 포함되지 않음',
    })
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            fileFilter: (req, file, callback) => {
                // 한글 파일명 인코딩 처리 (latin1 -> utf8)
                if (file.originalname) {
                    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
                }
                callback(null, true);
            },
        }),
    )
    async uploadFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('uploadBy') uploadBy: string,
        @Body('year') year: string,
        @Body('month') month: string,
        @Query('generateMonthlySummary') generateMonthlySummary?: string,
    ) {
        const shouldGenerateMonthly = generateMonthlySummary === 'true';
        return await this.attendanceExcelManagementService.uploadMultipleFiles(
            files,
            uploadBy,
            year,
            month,
            shouldGenerateMonthly,
        );
    }

    /**
     * 근태/출입 데이터 전체 삭제 (테스트용)
     *
     * ⚠️ 주의: 이 엔드포인트는 모든 데이터를 삭제합니다!
     * - event_info (출입 이벤트)
     * - daily_event_summaries (일일 요약)
     * - used_attendance (근태 사용 내역)
     */
    @Delete('clear-all')
    @ApiOperation({
        summary: '근태/출입 데이터 전체 삭제 (테스트용)',
        description: `
⚠️ **경고: 이 API는 모든 근태/출입 데이터를 삭제합니다!**

**삭제되는 데이터:**
1. 출입 이벤트 (event_info)
2. 일일 출입 요약 (daily_event_summaries)
3. 근태 사용 내역 (used_attendance)

**용도:** 개발/테스트 환경에서 데이터를 초기화할 때 사용

**주의사항:**
- 삭제된 데이터는 복구할 수 없습니다
- 프로덕션 환경에서는 이 엔드포인트를 제거하거나 비활성화하세요
        `,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '데이터 삭제 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '모든 데이터가 삭제되었습니다.' },
                deletedCounts: {
                    type: 'object',
                    properties: {
                        eventInfo: { type: 'number', example: 1500 },
                        dailyEventSummaries: { type: 'number', example: 1000 },
                        usedAttendance: { type: 'number', example: 150 },
                        total: { type: 'number', example: 2650 },
                    },
                },
            },
        },
    })
    async clearAllData() {
        return await this.attendanceExcelManagementService.clearAllData();
    }
}
