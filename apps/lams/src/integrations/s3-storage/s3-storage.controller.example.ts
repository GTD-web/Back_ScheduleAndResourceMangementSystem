import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    UseInterceptors,
    UploadedFile as NestUploadedFile,
    Query,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { S3StorageService } from './s3-storage.service';
import {
    UploadExcelDto,
    UploadExcelResponseDto,
    GetFileDto,
    GetFileResponseDto,
    DeleteFileDto,
    DeleteFileResponseDto,
    ListFilesDto,
    ListFilesResponseDto,
} from './dtos/upload-excel.dto';

/**
 * S3 파일 관리 컨트롤러 예시
 *
 * 이 컨트롤러는 사용 예시입니다.
 * 실제 프로젝트에서는 필요에 맞게 수정하여 사용하세요.
 */
@ApiTags('S3 파일 관리')
@Controller('api/files')
export class S3StorageController {
    constructor(private readonly s3StorageService: S3StorageService) {}

    /**
     * 엑셀 파일 업로드
     */
    @Post('upload')
    @ApiOperation({ summary: '엑셀 파일 업로드' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '업로드할 엑셀 파일',
                },
                fileName: {
                    type: 'string',
                    description: '저장할 파일 이름',
                },
                folder: {
                    type: 'string',
                    description: 'S3 저장 폴더 경로',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: '파일 업로드 성공',
        type: UploadExcelResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '잘못된 파일 형식 또는 크기 초과',
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadExcel(
        @NestUploadedFile() file: Express.Multer.File,
        @Body() dto?: UploadExcelDto,
    ): Promise<UploadExcelResponseDto> {
        return await this.s3StorageService.uploadExcel(file, dto);
    }

    /**
     * 파일 다운로드 URL 조회
     */
    @Get('download/:fileKey(*)')
    @ApiOperation({ summary: '파일 다운로드 URL 생성' })
    @ApiParam({
        name: 'fileKey',
        description: 'S3 파일 키 (예: excel-files/report.xlsx)',
        example: 'excel-files/1699999999-report.xlsx',
    })
    @ApiQuery({
        name: 'expiresIn',
        required: false,
        description: 'URL 만료 시간(초)',
        example: 3600,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '다운로드 URL 생성 성공',
        type: GetFileResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: '파일을 찾을 수 없음',
    })
    async getDownloadUrl(
        @Param('fileKey') fileKey: string,
        @Query('expiresIn') expiresIn?: number,
    ): Promise<GetFileResponseDto> {
        return await this.s3StorageService.getFileDownloadUrl({
            fileKey,
            expiresIn,
        });
    }

    /**
     * 파일 삭제
     */
    @Delete(':fileKey(*)')
    @ApiOperation({ summary: '파일 삭제' })
    @ApiParam({
        name: 'fileKey',
        description: '삭제할 S3 파일 키',
        example: 'excel-files/1699999999-report.xlsx',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '파일 삭제 성공',
        type: DeleteFileResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: '파일을 찾을 수 없음',
    })
    async deleteFile(@Param('fileKey') fileKey: string): Promise<DeleteFileResponseDto> {
        return await this.s3StorageService.deleteFile({ fileKey });
    }

    /**
     * 파일 목록 조회
     */
    @Get('list')
    @ApiOperation({ summary: '파일 목록 조회' })
    @ApiQuery({
        name: 'prefix',
        required: false,
        description: '조회할 폴더 경로',
        example: 'excel-files',
    })
    @ApiQuery({
        name: 'maxKeys',
        required: false,
        description: '최대 조회 개수',
        example: 100,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '파일 목록 조회 성공',
        type: ListFilesResponseDto,
    })
    async listFiles(
        @Query('prefix') prefix?: string,
        @Query('maxKeys') maxKeys?: number,
    ): Promise<ListFilesResponseDto> {
        return await this.s3StorageService.listFiles({ prefix, maxKeys });
    }
}
