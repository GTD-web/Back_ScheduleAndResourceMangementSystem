import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DataSnapshotService } from './data-snapshot.service';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { UpdateSnapshotDto } from './dto/update-snapshot.dto';
import { SnapshotType } from '../../domain/data-snapshot-info/data-snapshot-info.entity';

/**
 * 데이터 스냅샷 컨트롤러
 *
 * 월간 요약 데이터의 스냅샷 생성, 조회, 수정, 삭제 API를 제공합니다.
 */
@ApiTags('데이터 스냅샷')
@Controller('data-snapshot')
export class DataSnapshotController {
    constructor(private readonly dataSnapshotService: DataSnapshotService) {}

    /**
     * 스냅샷 생성
     */
    @Post()
    @ApiOperation({
        summary: '스냅샷 생성',
        description: `
월간 요약 데이터를 기반으로 스냅샷을 생성합니다.

**처리 과정:**
1. 월간 요약 데이터 검증
2. DataSnapshotInfo 생성
3. DataSnapshotChild 생성 (각 직원별 데이터)
4. 트랜잭션으로 일괄 저장

**사용 시나리오:**
- 월간 근태 확정 후 스냅샷 저장
- 결재 상신 전 데이터 백업
- 대시보드용 데이터 고정
        `,
    })
    @ApiBody({ type: CreateSnapshotDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: '스냅샷 생성 성공',
        schema: {
            type: 'object',
            properties: {
                dataSnapshotId: { type: 'string', example: 'uuid' },
                snapshotName: { type: 'string', example: '2024년 11월 근태 스냅샷' },
                description: { type: 'string', example: '2024년 11월 전 직원 근태 요약' },
                snapshotType: { type: 'string', example: 'MONTHLY' },
                yyyy: { type: 'string', example: '2024' },
                mm: { type: 'string', example: '11' },
                dataSnapshotChildInfoList: {
                    type: 'array',
                    items: { type: 'object' },
                },
                createdAt: { type: 'string', example: '2024-11-24T10:00:00.000Z' },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '잘못된 요청 데이터',
    })
    async createSnapshot(@Body() dto: CreateSnapshotDto) {
        return await this.dataSnapshotService.createSnapshot({
            snapshotName: dto.snapshotName,
            description: dto.description || '',
            snapshotType: dto.snapshotType,
            yyyy: dto.yyyy,
            mm: dto.mm,
            monthlySummaries: dto.monthlySummaries,
        });
    }

    /**
     * 모든 스냅샷 조회
     */
    @Get()
    @ApiOperation({
        summary: '모든 스냅샷 조회',
        description: `
모든 스냅샷을 조회합니다. (children 포함)

**쿼리 파라미터:**
- yyyy: 특정 연도 필터링
- mm: 특정 월 필터링
- snapshotType: 스냅샷 타입 필터링

**정렬:** 생성일 내림차순 (최신순)
        `,
    })
    @ApiQuery({ name: 'yyyy', required: false, description: '연도 (YYYY)', example: '2024' })
    @ApiQuery({ name: 'mm', required: false, description: '월 (MM)', example: '11' })
    @ApiQuery({
        name: 'snapshotType',
        required: false,
        enum: SnapshotType,
        description: '스냅샷 타입',
        example: SnapshotType.MONTHLY,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '스냅샷 목록 조회 성공',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    dataSnapshotId: { type: 'string' },
                    snapshotName: { type: 'string' },
                    description: { type: 'string' },
                    snapshotType: { type: 'string' },
                    yyyy: { type: 'string' },
                    mm: { type: 'string' },
                    dataSnapshotChildInfoList: { type: 'array' },
                    createdAt: { type: 'string' },
                },
            },
        },
    })
    async getAllSnapshots(
        @Query('yyyy') yyyy?: string,
        @Query('mm') mm?: string,
        @Query('snapshotType') snapshotType?: SnapshotType,
    ) {
        // 필터링 조건에 따라 다른 메서드 호출
        if (yyyy && mm && snapshotType) {
            return await this.dataSnapshotService.getSnapshotsByYearMonthAndType(yyyy, mm, snapshotType);
        } else if (yyyy && mm) {
            return await this.dataSnapshotService.getSnapshotsByYearMonth(yyyy, mm);
        } else if (snapshotType) {
            return await this.dataSnapshotService.getSnapshotsByType(snapshotType);
        } else {
            return await this.dataSnapshotService.getAllSnapshots();
        }
    }

    /**
     * 특정 스냅샷 조회 (ID로)
     */
    @Get(':dataSnapshotId')
    @ApiOperation({
        summary: '특정 스냅샷 조회',
        description: `
특정 스냅샷을 ID로 조회합니다. (children 포함)

**응답 데이터:**
- DataSnapshotInfo: 스냅샷 기본 정보
- dataSnapshotChildInfoList: 각 직원별 월간 요약 데이터
  - snapshotData: MonthlyEventSummary JSON
        `,
    })
    @ApiParam({
        name: 'dataSnapshotId',
        description: '스냅샷 ID (UUID)',
        example: 'uuid',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '스냅샷 조회 성공',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: '스냅샷을 찾을 수 없음',
    })
    async getSnapshotById(@Param('dataSnapshotId') dataSnapshotId: string) {
        return await this.dataSnapshotService.getSnapshotById(dataSnapshotId);
    }
}
