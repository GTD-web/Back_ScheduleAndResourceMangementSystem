import {
    Controller,
    Post,
    Body,
    UploadedFile,
    UseInterceptors,
    ParseUUIDPipe,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../../../common/decorators/user.decorator';
import { FileManagementBusinessService } from '../../business/file-management-business/file-management-business.service';
import { UploadFileRequestDto, UploadFileResponseDto } from './dto/upload-file.dto';
import { ReflectFileContentRequestDto, ReflectFileContentResponseDto } from './dto/reflect-file-content.dto';

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
     * 여러 파일을 순서대로 반영할 수 있습니다.
     */
    @Post('reflect')
    @ApiOperation({
        summary: '파일 내용 반영',
        description: '업로드된 파일의 내용을 순서대로 반영하고 일일/월간 요약을 자동으로 생성합니다.',
    })
    async reflectFileContent(
        @Body() dto: ReflectFileContentRequestDto,
        @User('id') performedBy: string,
    ): Promise<ReflectFileContentResponseDto> {
        if (!performedBy) {
            throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }

        const result = await this.fileManagementBusinessService.파일내용을반영한다(
            dto.fileIds,
            dto.employeeIds,
            dto.year,
            dto.month,
            performedBy,
        );

        return {
            reflections: result.reflections,
        };
    }
}
