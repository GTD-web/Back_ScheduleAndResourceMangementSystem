import {
    Controller,
    Get,
    Query,
    Param,
    Patch,
    Body,
    BadRequestException,
    ParseUUIDPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { User } from '../../../libs/decorators/user.decorator';
import { AttendanceIssueBusinessService } from '../../business/attendance-issue-business/attendance-issue-business.service';
import {
    GetAttendanceIssuesRequestDto,
    GetAttendanceIssuesResponseDto,
    AttendanceIssueResponseDto,
    UpdateAttendanceIssueDescriptionRequestDto,
    UpdateAttendanceIssueCorrectionRequestDto,
    ApplyAttendanceIssueRequestDto,
    RejectAttendanceIssueRequestDto,
} from './dto/attendance-issue.dto';
import { AttendanceIssueStatus } from '../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 컨트롤러
 *
 * 근태 이슈 관련 API를 제공합니다.
 * - 직원: 사유 작성
 * - 관리자: 이슈 조회, 수정 정보 설정, 반영/미반영 처리
 */
@ApiTags('근태 이슈')
@ApiBearerAuth()
@Controller('attendance-issues')
export class AttendanceIssueController {
    constructor(private readonly attendanceIssueBusinessService: AttendanceIssueBusinessService) {}

    /**
     * 근태 이슈 목록 조회 (관리자용)
     */
    @Get()
    @ApiOperation({
        summary: '근태 이슈 목록 조회',
        description: '근태 이슈 목록을 조회합니다. 직원ID, 날짜 범위, 상태로 필터링할 수 있습니다.',
    })
    @ApiQuery({ name: 'employeeId', description: '직원 ID', required: false })
    @ApiQuery({ name: 'startDate', description: '시작 날짜 (yyyy-MM-dd)', required: false })
    @ApiQuery({ name: 'endDate', description: '종료 날짜 (yyyy-MM-dd)', required: false })
    @ApiQuery({ name: 'status', description: '상태', enum: AttendanceIssueStatus, required: false })
    async getAttendanceIssues(@Query() query: GetAttendanceIssuesRequestDto): Promise<GetAttendanceIssuesResponseDto> {
        const result = await this.attendanceIssueBusinessService.근태이슈목록을조회한다({
            employeeId: query.employeeId,
            startDate: query.startDate,
            endDate: query.endDate,
            status: query.status,
        });

        return result;
    }

    /**
     * 근태 이슈 상세 조회
     */
    @Get(':id')
    @ApiOperation({
        summary: '근태 이슈 상세 조회',
        description: '근태 이슈 상세 정보를 조회합니다.',
    })
    @ApiParam({ name: 'id', description: '근태 이슈 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    async getAttendanceIssue(@Param('id', ParseUUIDPipe) id: string): Promise<AttendanceIssueResponseDto> {
        const result = await this.attendanceIssueBusinessService.근태이슈를조회한다(id);
        return result.issue;
    }

    /**
     * 근태 이슈 사유 수정 (직원용)
     */
    @Patch(':id/description')
    @ApiOperation({
        summary: '근태 이슈 사유 수정',
        description: '근태 이슈의 사유를 작성합니다. 사유를 작성하면 상태가 미반영으로 변경됩니다.',
    })
    @ApiParam({ name: 'id', description: '근태 이슈 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    async updateAttendanceIssueDescription(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAttendanceIssueDescriptionRequestDto,
        @User('id') userId: string,
    ): Promise<AttendanceIssueResponseDto> {
        if (!userId) {
            throw new BadRequestException('직원 정보를 찾을 수 없습니다.');
        }

        const result = await this.attendanceIssueBusinessService.근태이슈사유를수정한다(id, dto.description, userId);
        return result.issue;
    }

    /**
     * 근태 이슈 수정 정보 설정 (관리자용)
     */
    @Patch(':id/correction')
    @ApiOperation({
        summary: '근태 이슈 수정 정보 설정',
        description: `근태 이슈의 수정 정보(출퇴근 시간 또는 근태유형)를 설정합니다. 
수정 정보를 설정하면 상태가 미반영으로 변경됩니다.
출퇴근 시간 수정과 근태유형 수정은 동시에 할 수 없으며, 둘 중 하나만 선택하여 설정할 수 있습니다.`,
    })
    @ApiParam({ name: 'id', description: '근태 이슈 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    async updateAttendanceIssueCorrection(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAttendanceIssueCorrectionRequestDto,
        @User('id') userId: string,
    ): Promise<AttendanceIssueResponseDto> {
        if (!userId) {
            throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }

        const result = await this.attendanceIssueBusinessService.근태이슈수정정보를설정한다(
            id,
            {
                correctedEnterTime: dto.correctedEnterTime,
                correctedLeaveTime: dto.correctedLeaveTime,
                correctedAttendanceTypeIds: dto.correctedAttendanceTypeIds,
            },
            userId,
        );
        return result.issue;
    }

    /**
     * 근태 이슈 반영 (관리자용)
     */
    @Patch(':id/apply')
    @ApiOperation({
        summary: '근태 이슈 반영',
        description: `근태 이슈를 반영합니다. 
수정 정보가 설정된 이슈만 반영할 수 있으며, 반영 시 일간 요약에 수정 정보가 반영됩니다.
한번 반영된 이슈는 더 이상 수정할 수 없습니다.`,
    })
    @ApiParam({ name: 'id', description: '근태 이슈 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    async applyAttendanceIssue(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ApplyAttendanceIssueRequestDto,
        @User('id') userId: string,
    ): Promise<AttendanceIssueResponseDto> {
        if (!userId) {
            throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }

        const result = await this.attendanceIssueBusinessService.근태이슈를반영한다(
            id,
            dto.confirmedBy || '관리자',
            userId,
        );
        return result.issue;
    }

    /**
     * 근태 이슈 수정 요청 (직원용)
     */
    @Patch(':id/request-correction')
    @ApiOperation({
        summary: '근태 이슈 수정 요청',
        description: '근태 이슈에 대한 수정을 요청합니다. 관리자가 수정 정보를 설정할 수 있도록 요청합니다.',
    })
    @ApiParam({ name: 'id', description: '근태 이슈 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    async requestCorrection(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: { description?: string },
        @User('id') userId: string,
    ): Promise<AttendanceIssueResponseDto> {
        if (!userId) {
            throw new BadRequestException('직원 정보를 찾을 수 없습니다.');
        }

        // TODO: 비즈니스 서비스에 수정요청 메서드 구현 필요
        const result = await this.attendanceIssueBusinessService.근태이슈를조회한다(id);
        return result.issue;
    }

    /**
     * 근태 이슈 재요청 (직원용)
     */
    @Patch(':id/re-request')
    @ApiOperation({
        summary: '근태 이슈 재요청',
        description: '미반영 처리된 근태 이슈를 재요청합니다. 사유를 수정하여 다시 요청할 수 있습니다.',
    })
    @ApiParam({ name: 'id', description: '근태 이슈 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    async reRequest(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAttendanceIssueDescriptionRequestDto,
        @User('id') userId: string,
    ): Promise<AttendanceIssueResponseDto> {
        if (!userId) {
            throw new BadRequestException('직원 정보를 찾을 수 없습니다.');
        }

        // TODO: 비즈니스 서비스에 재요청 메서드 구현 필요
        // 일단 사유 수정으로 처리
        const result = await this.attendanceIssueBusinessService.근태이슈사유를수정한다(id, dto.description, userId);
        return result.issue;
    }
}
