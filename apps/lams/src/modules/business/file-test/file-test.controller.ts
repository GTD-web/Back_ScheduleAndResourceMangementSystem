import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Query,
    Body,
    UseInterceptors,
    UploadedFile,
    HttpStatus,
    Res,
    StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { FileManagementContext } from '../../context/file-management';
import { ExcelReaderService } from '../../integrations/excel-reader';

/**
 * 파일 테스트 컨트롤러
 *
 * 파일 업로드, 다운로드, 읽기 기능을 테스트할 수 있는 API를 제공합니다.
 */
@ApiTags('파일 관리 테스트')
@Controller('api/file-test')
export class FileTestController {
    constructor(
        private readonly fileManagementContext: FileManagementContext,
        private readonly excelReader: ExcelReaderService,
    ) {}

    /**
     * 파일 업로드 및 엔티티 생성
     */
    @Post('upload')
    @ApiOperation({ summary: '파일 업로드 및 엔티티 생성' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '업로드할 파일',
                },
                uploadBy: {
                    type: 'string',
                    description: '업로드한 사용자 ID',
                },
                folder: {
                    type: 'string',
                    description: 'S3 저장 폴더',
                },
                year: {
                    type: 'string',
                    description: '연도',
                },
                month: {
                    type: 'string',
                    description: '월',
                },
            },
            required: ['file', 'uploadBy'],
        },
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: '파일 업로드 성공',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '잘못된 요청',
    })
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: (req, file, callback) => {
                // 한글 파일명 디코딩 처리
                const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
                file.originalname = originalname;
                callback(null, true);
            },
        }),
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('uploadBy') uploadBy: string,
        @Body('folder') folder?: string,
        @Body('year') year?: string,
        @Body('month') month?: string,
    ) {
        const result = await this.fileManagementContext.uploadFile(file, uploadBy, {
            folder,
            year,
            month,
        });

        return {
            success: true,
            message: '파일이 성공적으로 업로드되었습니다.',
            data: {
                fileId: result.fileEntity.fileId,
                fileName: result.fileEntity.fileOriginalName,
                status: result.fileEntity.status,
                uploadedAt: result.fileEntity.uploadedAt,
                s3: {
                    fileKey: result.s3Info.fileKey,
                    bucket: result.s3Info.bucket,
                    url: result.s3Info.url,
                },
            },
        };
    }

    /**
     * 파일 다운로드 URL 생성
     */
    @Get(':fileId/download-url')
    @ApiOperation({ summary: '파일 다운로드 URL 생성' })
    @ApiParam({
        name: 'fileId',
        description: '파일 ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
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
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: '파일을 찾을 수 없음',
    })
    async getDownloadUrl(@Param('fileId') fileId: string, @Query('expiresIn') expiresIn?: number) {
        const result = await this.fileManagementContext.getFileDownloadUrl(
            fileId,
            expiresIn ? parseInt(expiresIn.toString()) : undefined,
        );

        return {
            success: true,
            data: {
                fileId: result.fileEntity.fileId,
                fileName: result.fileEntity.fileOriginalName,
                downloadUrl: result.downloadUrl,
                expiresAt: result.expiresAt,
            },
        };
    }

    /**
     * 파일 내용 읽기 (메타데이터만 반환)
     */
    @Get(':fileId/read')
    @ApiOperation({ summary: '파일 내용 읽기 (메타데이터만)' })
    @ApiParam({
        name: 'fileId',
        description: '파일 ID',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '파일 읽기 성공',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: '파일을 찾을 수 없음',
    })
    async readFileMetadata(@Param('fileId') fileId: string) {
        const result = await this.fileManagementContext.readFileContent(fileId);

        return {
            success: true,
            message: '파일을 성공적으로 읽었습니다.',
            data: {
                fileId: result.fileEntity.fileId,
                fileName: result.fileEntity.fileOriginalName,
                contentType: result.contentType,
                contentSize: result.content.length,
                status: result.fileEntity.status,
                readAt: result.fileEntity.readAt,
            },
        };
    }

    /**
     * 파일 내용 다운로드 (실제 파일 스트림)
     */
    @Get(':fileId/download')
    @ApiOperation({ summary: '파일 다운로드 (실제 파일)' })
    @ApiParam({
        name: 'fileId',
        description: '파일 ID',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '파일 다운로드 성공',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: '파일을 찾을 수 없음',
    })
    async downloadFile(@Param('fileId') fileId: string, @Res({ passthrough: true }) res: Response) {
        const result = await this.fileManagementContext.readFileContent(fileId);

        res.set({
            'Content-Type': result.contentType,
            'Content-Disposition': `attachment; filename="${result.fileEntity.fileOriginalName}"`,
            'Content-Length': result.content.length,
        });

        return new StreamableFile(result.content);
    }

    /**
     * 읽지 않은 파일 목록 조회
     */
    @Get('unread')
    @ApiOperation({ summary: '읽지 않은 파일 목록 조회' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '조회 성공',
    })
    async getUnreadFiles() {
        const files = await this.fileManagementContext.getUnreadFiles();

        return {
            success: true,
            count: files.length,
            data: files.map((file) => ({
                fileId: file.fileId,
                fileName: file.fileOriginalName,
                uploadBy: file.uploadBy,
                uploadedAt: file.uploadedAt,
                status: file.status,
            })),
        };
    }

    /**
     * 에러 파일 목록 조회
     */
    @Get('errors')
    @ApiOperation({ summary: '에러 파일 목록 조회' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '조회 성공',
    })
    async getErrorFiles() {
        const files = await this.fileManagementContext.getErrorFiles();

        return {
            success: true,
            count: files.length,
            data: files.map((file) => ({
                fileId: file.fileId,
                fileName: file.fileOriginalName,
                uploadBy: file.uploadBy,
                uploadedAt: file.uploadedAt,
                status: file.status,
                error: file.error,
                readAt: file.readAt,
            })),
        };
    }

    /**
     * 연도/월별 파일 조회
     */
    @Get('by-date')
    @ApiOperation({ summary: '연도/월별 파일 조회' })
    @ApiQuery({ name: 'year', description: '연도', example: '2024' })
    @ApiQuery({ name: 'month', description: '월', example: '11' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '조회 성공',
    })
    async getFilesByDate(@Query('year') year: string, @Query('month') month: string) {
        const files = await this.fileManagementContext.getFilesByYearAndMonth(year, month);

        return {
            success: true,
            count: files.length,
            data: files.map((file) => ({
                fileId: file.fileId,
                fileName: file.fileOriginalName,
                uploadBy: file.uploadBy,
                uploadedAt: file.uploadedAt,
                status: file.status,
                year: file.year,
                month: file.month,
            })),
        };
    }

    /**
     * 사용자별 파일 조회
     */
    @Get('by-user/:uploadBy')
    @ApiOperation({ summary: '사용자별 파일 조회' })
    @ApiParam({ name: 'uploadBy', description: '업로드한 사용자 ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '조회 성공',
    })
    async getFilesByUser(@Param('uploadBy') uploadBy: string) {
        const files = await this.fileManagementContext.getFilesByUploadBy(uploadBy);

        return {
            success: true,
            count: files.length,
            data: files.map((file) => ({
                fileId: file.fileId,
                fileName: file.fileOriginalName,
                uploadedAt: file.uploadedAt,
                status: file.status,
                year: file.year,
                month: file.month,
            })),
        };
    }

    /**
     * 파일 삭제
     */
    @Delete(':fileId')
    @ApiOperation({ summary: '파일 삭제 (S3 및 DB)' })
    @ApiParam({ name: 'fileId', description: '파일 ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '삭제 성공',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: '파일을 찾을 수 없음',
    })
    async deleteFile(@Param('fileId') fileId: string) {
        await this.fileManagementContext.deleteFile(fileId);

        return {
            success: true,
            message: '파일이 성공적으로 삭제되었습니다.',
            fileId,
        };
    }

    /**
     * 엑셀 파일 정보 조회
     */
    @Get(':fileId/excel-info')
    @ApiOperation({ summary: '엑셀 파일 정보 조회 (워크시트 목록)' })
    @ApiParam({ name: 'fileId', description: '파일 ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '조회 성공',
    })
    async getExcelInfo(@Param('fileId') fileId: string) {
        const { content } = await this.fileManagementContext.readFileContent(fileId);
        const info = await this.excelReader.getFileInfo(content);

        return {
            success: true,
            data: info,
        };
    }

    /**
     * 엑셀 데이터 읽기
     */
    @Get(':fileId/excel-data')
    @ApiOperation({ summary: '엑셀 데이터 읽기' })
    @ApiParam({ name: 'fileId', description: '파일 ID' })
    @ApiQuery({ name: 'sheetName', required: false, description: '워크시트 이름' })
    @ApiQuery({ name: 'sheetIndex', required: false, description: '워크시트 인덱스 (0부터)' })
    @ApiQuery({ name: 'hasHeader', required: false, description: '헤더 포함 여부', type: Boolean })
    @ApiQuery({ name: 'startRow', required: false, description: '시작 행', type: Number })
    @ApiQuery({ name: 'endRow', required: false, description: '종료 행', type: Number })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '읽기 성공',
    })
    async readExcelData(
        @Param('fileId') fileId: string,
        @Query('sheetName') sheetName?: string,
        @Query('sheetIndex') sheetIndex?: string,
        @Query('hasHeader') hasHeader?: string,
        @Query('startRow') startRow?: string,
        @Query('endRow') endRow?: string,
    ) {
        const { content } = await this.fileManagementContext.readFileContent(fileId);

        const options: any = {};
        if (sheetName) options.sheetName = sheetName;
        if (sheetIndex !== undefined) options.sheetIndex = parseInt(sheetIndex);
        if (hasHeader !== undefined) options.hasHeader = hasHeader === 'true';
        if (startRow) options.startRow = parseInt(startRow);
        if (endRow) options.endRow = parseInt(endRow);

        const data = await this.excelReader.readWorksheet(content, options);
        console.log(data);

        return {
            success: true,
            data,
        };
    }

    /**
     * 엑셀을 CSV로 변환
     */
    @Get(':fileId/to-csv')
    @ApiOperation({ summary: '엑셀을 CSV로 변환' })
    @ApiParam({ name: 'fileId', description: '파일 ID' })
    @ApiQuery({ name: 'sheetName', required: false, description: '워크시트 이름' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'CSV 변환 성공',
    })
    async convertToCSV(
        @Param('fileId') fileId: string,
        @Query('sheetName') sheetName?: string,
        @Res({ passthrough: true }) res?: Response,
    ) {
        const { content, fileEntity } = await this.fileManagementContext.readFileContent(fileId);

        const data = await this.excelReader.readWorksheet(content, { sheetName });
        const csv = await this.excelReader.convertToCSV(data);

        res.set({
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${fileEntity.fileOriginalName?.replace('.xlsx', '.csv')}"`,
        });

        return csv;
    }

    /**
     * 엑셀 파일을 JSON 배열로 읽기 (통합 메서드 - S3 다운로드 + 파싱)
     */
    @Get(':fileId/read-excel-json')
    @ApiOperation({ summary: '엑셀 파일을 JSON 배열로 읽기 (S3 다운로드 + 파싱 통합)' })
    @ApiParam({ name: 'fileId', description: '파일 엔티티 ID' })
    @ApiQuery({ name: 'sheetName', required: false, description: '워크시트 이름' })
    @ApiQuery({ name: 'startRow', required: false, description: '시작 행 (1부터 시작)', type: Number })
    @ApiQuery({ name: 'endRow', required: false, description: '끝 행', type: Number })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '읽기 성공',
    })
    async readExcelAsJson(
        @Param('fileId') fileId: string,
        @Query('sheetName') sheetName?: string,
        @Query('startRow') startRow?: string,
        @Query('endRow') endRow?: string,
    ) {
        const records = await this.fileManagementContext.readExcelAsJson(fileId, {
            sheetName,
            startRow: startRow ? parseInt(startRow) : undefined,
            endRow: endRow ? parseInt(endRow) : undefined,
        });

        return {
            success: true,
            count: records.length,
            data: records,
        };
    }

    /**
     * 엑셀 파일의 여러 워크시트 읽기 (통합 메서드)
     */
    @Get(':fileId/read-multiple-sheets')
    @ApiOperation({ summary: '엑셀 파일의 여러 워크시트 읽기 (S3 다운로드 + 파싱 통합)' })
    @ApiParam({ name: 'fileId', description: '파일 엔티티 ID' })
    @ApiQuery({ name: 'sheetNames', required: false, description: '워크시트 이름 (쉼표로 구분, 없으면 전체)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '읽기 성공',
    })
    async readMultipleSheets(@Param('fileId') fileId: string, @Query('sheetNames') sheetNames?: string) {
        const sheets = await this.fileManagementContext.readExcelMultipleSheets(
            fileId,
            sheetNames ? sheetNames.split(',') : undefined,
        );

        return {
            success: true,
            sheetCount: sheets.length,
            sheets,
        };
    }
}
