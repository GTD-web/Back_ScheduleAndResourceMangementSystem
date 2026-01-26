import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    UploadedFile,
    UseInterceptors,
    ParseUUIDPipe,
    BadRequestException,
    Delete,
    Param,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import { User } from '../../../libs/decorators/user.decorator';
import { FileManagementBusinessService } from '../../business/file-management-business/file-management-business.service';
import { UploadFileRequestDto, UploadFileResponseDto } from './dto/upload-file.dto';
import { ReflectFileContentRequestDto, ReflectFileContentResponseDto } from './dto/reflect-file-content.dto';
import { RestoreFromHistoryRequestDto, RestoreFromHistoryResponseDto } from './dto/restore-from-history.dto';
import {
    GetFileListWithHistoryRequestDto,
    GetFileListWithHistoryResponseDto,
} from './dto/get-file-list-with-history.dto';
import { IGetFileListWithHistoryResponse } from '../../context/file-management-context/interfaces/response/get-file-list-with-history-response.interface';

/**
 * 파일 관리 컨트롤러
 *
 * 파일 업로드 및 파일 내용 반영 API를 제공합니다.
 */
@ApiTags('파일 관리')
@ApiBearerAuth()
@Controller('file-management')
export class FileManagementController {
    constructor(private readonly fileManagementBusinessService: FileManagementBusinessService) {}

    /**
     * 파일 업로드
     *
     * 엑셀 파일을 업로드하고 검증합니다.
     */
    @Post('upload')
    @ApiOperation({ summary: '파일 업로드', description: '엑셀 파일을 업로드하고 검증합니다.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '업로드할 엑셀 파일 (.xlsx, .xls, .csv)',
                },
                year: {
                    type: 'string',
                    description: '연도 (선택사항)',
                    example: '2024',
                },
                month: {
                    type: 'string',
                    description: '월 (선택사항)',
                    example: '01',
                },
            },
            required: ['file'],
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: (req, file, callback) => {
                // 한글 파일명 디코딩 처리
                // 브라우저에서 전송된 파일명이 ISO-8859-1 (latin1)로 인코딩되어 있는 경우 UTF-8로 변환
                try {
                    const decodedFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
                    file.originalname = decodedFilename;
                } catch (error) {
                    // 디코딩 실패 시 원본 파일명 유지
                }
                callback(null, true);
            },
        }),
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadFileRequestDto,
        @User('id') uploadBy: string,
    ): Promise<UploadFileResponseDto> {
        if (!file) {
            throw new BadRequestException('파일이 제공되지 않았습니다.');
        }

        if (!uploadBy) {
            throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }

        const result = await this.fileManagementBusinessService.파일을업로드한다(file, uploadBy, dto.year, dto.month);

        return {
            fileId: result.fileId,
            fileName: result.fileName,
            filePath: result.filePath,
            year: result.year,
            month: result.month,
        };
    }

    /**
     * 파일 내용 반영
     *
     * 업로드된 파일의 내용을 반영하고 일일/월간 요약을 생성합니다.
     */
    @Post('reflect')
    @ApiOperation({
        summary: '파일 내용 반영',
        description: '업로드된 파일의 내용을 반영하고 일일/월간 요약을 자동으로 생성합니다.',
    })
    async reflectFileContent(
        @Body() dto: ReflectFileContentRequestDto,
        @User('id') performedBy: string,
    ): Promise<ReflectFileContentResponseDto> {
        if (!performedBy) {
            throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }

        const result = await this.fileManagementBusinessService.파일내용을반영한다(
            dto.fileId,
            dto.employeeNumbers,
            dto.year,
            dto.month,
            performedBy,
            dto.info,
        );

        return {
            fileId: result.fileId,
            reflectionHistoryId: result.reflectionHistoryId,
        };
    }

    /**
     * 이력으로 되돌리기
     *
     * 파일 내용 반영 이력을 선택하여 해당 이력의 데이터로 되돌립니다.
     */
    @Post('restore-from-history')
    @ApiOperation({
        summary: '이력으로 되돌리기',
        description:
            '파일 내용 반영 이력을 선택하여 해당 이력의 데이터로 되돌립니다. 이력에 저장된 데이터를 그대로 사용하여 해당 연월의 데이터를 복원합니다.',
    })
    async restoreFromHistory(
        @Body() dto: RestoreFromHistoryRequestDto,
        @User('id') performedBy: string,
    ): Promise<RestoreFromHistoryResponseDto> {
        if (!performedBy) {
            throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }

        if (!dto.reflectionHistoryId) {
            throw new BadRequestException('반영 이력 ID는 필수입니다.');
        }

        const result = await this.fileManagementBusinessService.파일내용반영이력으로되돌리기(
            dto.reflectionHistoryId,
            dto.year,
            dto.month,
            performedBy,
        );

        return {
            reflectionHistoryId: result.reflectionHistoryId,
            restoreSnapshotResult: {
                year: result.restoreSnapshotResult.year,
                month: result.restoreSnapshotResult.month,
            },
        };
    }

    /**
     * 파일 목록과 반영이력 조회
     *
     * 파일 목록을 조회하고 각 파일의 반영이력을 함께 조회합니다.
     * 연도와 월을 선택적으로 필터링할 수 있습니다.
     */
    @Get('files')
    @ApiOperation({
        summary: '파일 목록과 반영이력 조회',
        description: '파일 목록을 조회하고 각 파일의 반영이력을 함께 조회합니다. 연도와 월을 필수로 제공해야 합니다.',
    })
    @ApiQuery({ name: 'year', description: '연도', example: '2024', required: true })
    @ApiQuery({ name: 'month', description: '월', example: '01', required: true })
    @ApiResponse({
        status: 200,
        description: '파일 목록과 반영이력 조회 성공',
        type: GetFileListWithHistoryResponseDto,
    })
    async getFileListWithHistory(
        @Query() dto: GetFileListWithHistoryRequestDto,
    ): Promise<IGetFileListWithHistoryResponse> {
        if (!dto.year || !dto.month) {
            throw new BadRequestException('연도와 월은 필수입니다.');
        }

        const result = await this.fileManagementBusinessService.파일목록과반영이력을조회한다({
            year: dto.year,
            month: dto.month,
        });

        return result;
    }

    /**
     * 파일 다운로드
     *
     * 파일 ID로 파일을 다운로드합니다.
     */
    @Get('files/:id/download')
    @ApiOperation({
        summary: '파일 다운로드',
        description: '파일 ID로 파일을 다운로드합니다.',
    })
    @ApiParam({ name: 'id', description: '파일 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({
        status: 200,
        description: '파일 다운로드 성공',
    })
    async downloadFile(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
        // TODO: 비즈니스 서비스에 파일 다운로드 메서드 구현 필요
        throw new BadRequestException('아직 구현되지 않은 기능입니다.');
    }

    /**
     * 파일 삭제
     *
     * 파일 ID로 파일을 삭제합니다.
     */
    @Delete('files/:id')
    @ApiOperation({
        summary: '파일 삭제',
        description: '파일 ID로 파일을 삭제합니다.',
    })
    @ApiParam({ name: 'id', description: '파일 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({
        status: 200,
        description: '파일 삭제 성공',
    })
    async deleteFile(@Param('id', ParseUUIDPipe) id: string, @User('id') userId: string) {
        if (!userId) {
            throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }

        // TODO: 비즈니스 서비스에 파일 삭제 메서드 구현 필요
        throw new BadRequestException('아직 구현되지 않은 기능입니다.');
    }
}
