import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Query,
    Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileManagementService } from '../file-management.service';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody, ApiOperation, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { FileResponseDto } from '../../../business.dto.index';
import { MimeType } from '../../../../libs/enums/mime-type.enum';
import { CreateFileDataDto } from '../dtos';

@ApiTags('v2 파일 관리')
@Controller('v2/files')
@ApiBearerAuth()
export class FileController {
    constructor(private readonly fileManagementService: FileManagementService) {}

    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: '파일 업로드' })
    @ApiOkResponse({ status: 200, description: '파일 업로드 성공', type: FileResponseDto })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        return this.fileManagementService.uploadFile(file);
    }

    @Post('upload/multiple')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @ApiOperation({ summary: '여러 파일 업로드' })
    @ApiOkResponse({ status: 200, description: '여러 파일 업로드 성공', type: [FileResponseDto] })
    @UseInterceptors(FilesInterceptor('files', 10)) // 최대 10개 파일 업로드 가능
    async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
        return this.fileManagementService.uploadMultipleFiles(files);
    }

    @Delete('multiple')
    @ApiOperation({ summary: '여러 파일 삭제' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                fileIds: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
            },
        },
    })
    @ApiOkResponse({ status: 200, description: '여러 파일 삭제 성공' })
    async deleteMultipleFiles(@Body('fileIds') fileIds: string[]) {
        await this.fileManagementService.deleteMultipleFiles(fileIds);
    }

    @Get('presigned-url')
    @ApiOperation({ summary: 'Presigned URL 생성' })
    @ApiOkResponse({ status: 200, description: 'Presigned URL 생성 성공' })
    @ApiQuery({ name: 'mime', enum: MimeType, example: MimeType.IMAGE_PNG, required: true })
    async getPresignedUrl(@Query('mime') mime: MimeType) {
        return this.fileManagementService.getPresignedUrl(mime);
    }

    @Post('data')
    @ApiOperation({ summary: '파일 데이터 생성' })
    @ApiOkResponse({ status: 200, description: '파일 데이터 생성 성공', type: FileResponseDto })
    async createFileData(@Body() createFileDataDto: CreateFileDataDto) {
        return this.fileManagementService.createFileData(createFileDataDto);
    }

    @Delete(':fileId')
    @ApiOperation({ summary: '파일 삭제' })
    @ApiOkResponse({ status: 200, description: '파일 삭제 성공' })
    async deleteFile(@Param('fileId') fileId: string) {
        await this.fileManagementService.deleteFile(fileId);
    }
}
