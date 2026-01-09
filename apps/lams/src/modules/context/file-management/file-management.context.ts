import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { S3StorageService } from '../../integrations/s3-storage';
import { DomainFileService, File } from '../../domain/file';
import { ExcelReaderService, ExcelDataResultDto, ReadExcelOptionsDto } from '../../integrations/excel-reader';

/**
 * 파일 업로드 결과 DTO
 */
export interface FileUploadResult {
    fileEntity: File;
    s3Info: {
        fileKey: string;
        bucket: string;
        url: string;
    };
}

/**
 * 파일 다운로드 결과 DTO
 */
export interface FileDownloadResult {
    fileEntity: File;
    downloadUrl: string;
    expiresAt: Date;
}

/**
 * 파일 내용 읽기 결과 DTO
 */
export interface FileContentResult {
    fileEntity: File;
    content: Buffer;
    contentType: string;
}

/**
 * 엑셀 파일 읽기 결과 DTO
 */
export interface ExcelFileReadResult {
    fileEntity: File;
    excelData: ExcelDataResultDto;
    rawContent: Buffer;
}

/**
 * FileManagementContext
 * 파일 업로드, 다운로드, 읽기를 위한 컨텍스트
 * S3 스토리지와 파일 도메인을 조합하여 파일 관리 로직을 구현합니다.
 */
@Injectable()
export class FileManagementContext {
    private readonly logger = new Logger(FileManagementContext.name);

    constructor(
        private readonly s3StorageService: S3StorageService,
        private readonly fileService: DomainFileService,
        private readonly excelReader: ExcelReaderService,
    ) {}

    /**
     * 파일 업로드 및 엔티티 생성
     *
     * @param file 업로드할 파일
     * @param uploadBy 업로드한 사용자 ID
     * @param options 추가 옵션 (folder, year, month)
     * @returns 파일 업로드 결과
     */
    async uploadFile(
        file: Express.Multer.File,
        uploadBy: string,
        options?: {
            folder?: string;
            year?: string;
            month?: string;
        },
    ): Promise<FileUploadResult> {
        try {
            this.logger.log(`파일 업로드 시작: ${file.originalname}, 업로드자: ${uploadBy}`);

            // 1. S3에 파일 업로드
            const uploadResult = await this.s3StorageService.uploadExcel(file as any, {
                fileName: file.originalname,
                folder: options?.folder,
            });

            this.logger.log(`S3 업로드 완료: ${uploadResult.fileKey}`);

            // 2. 파일 엔티티 생성
            const fileEntity = await this.fileService.createFile({
                fileName: uploadResult.fileKey,
                fileOriginalName: file.originalname,
                filePath: uploadResult.url,
                uploadBy,
                year: options?.year,
                month: options?.month,
            });

            this.logger.log(`파일 엔티티 생성 완료: ${fileEntity.fileId}`);

            return {
                fileEntity,
                s3Info: {
                    fileKey: uploadResult.fileKey,
                    bucket: uploadResult.bucket,
                    url: uploadResult.url,
                },
            };
        } catch (error) {
            this.logger.error(`파일 업로드 실패: ${error.message}`, error.stack);
            throw new BadRequestException(`파일 업로드 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 파일 다운로드 URL 생성
     *
     * @param fileId 파일 엔티티 ID
     * @param expiresIn URL 만료 시간 (초, 기본값: 3600)
     * @returns 파일 다운로드 결과
     */
    async getFileDownloadUrl(fileId: string, expiresIn: number = 3600): Promise<FileDownloadResult> {
        try {
            this.logger.log(`파일 다운로드 URL 생성 시작: ${fileId}`);

            // 1. 파일 엔티티 조회
            const fileEntity = await this.fileService.findOne({ where: { fileId } });
            if (!fileEntity) {
                throw new NotFoundException('파일을 찾을 수 없습니다.');
            }

            // 2. S3 다운로드 URL 생성
            const downloadUrl = await this.s3StorageService.getFileDownloadUrl({
                fileKey: fileEntity.fileName,
                expiresIn,
            });

            this.logger.log(`다운로드 URL 생성 완료: ${fileId}`);

            return {
                fileEntity,
                downloadUrl: downloadUrl.url,
                expiresAt: downloadUrl.expiresAt,
            };
        } catch (error) {
            this.logger.error(`다운로드 URL 생성 실패: ${error.message}`, error.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`다운로드 URL 생성 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 파일 내용 읽기
     *
     * @param fileId 파일 엔티티 ID
     * @returns 파일 내용 및 메타데이터
     */
    async readFileContent(fileId: string): Promise<FileContentResult> {
        try {
            this.logger.log(`파일 내용 읽기 시작: ${fileId}`);

            // 1. 파일 엔티티 조회
            const fileEntity = await this.fileService.findOne({ where: { fileId } });
            if (!fileEntity) {
                throw new NotFoundException('파일을 찾을 수 없습니다.');
            }

            // 2. S3에서 파일 스트림 다운로드
            const content = await this.s3StorageService.downloadFileStream(fileEntity.fileName);

            this.logger.log(`파일 내용 읽기 완료: ${fileId}, 크기: ${content.length} bytes`);

            // 3. 파일을 읽음 상태로 업데이트
            await this.fileService.markAsRead(fileId);

            // 4. MIME 타입 결정
            const contentType = this.getContentType(fileEntity.fileOriginalName || fileEntity.fileName);

            return {
                fileEntity,
                content,
                contentType,
            };
        } catch (error) {
            this.logger.error(`파일 내용 읽기 실패: ${error.message}`, error.stack);

            // 파일 엔티티가 존재하면 에러 상태로 업데이트
            try {
                await this.fileService.markAsError(fileId, error.message);
            } catch (updateError) {
                this.logger.error(`파일 에러 상태 업데이트 실패: ${updateError.message}`);
            }

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`파일 내용 읽기 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 파일 목록 조회 (읽지 않은 파일)
     */
    async getUnreadFiles(): Promise<File[]> {
        return this.fileService.findUnreadFiles();
    }

    /**
     * 파일 목록 조회 (에러 파일)
     */
    async getErrorFiles(): Promise<File[]> {
        return this.fileService.findErrorFiles();
    }

    /**
     * 연도/월별 파일 조회
     */
    async getFilesByYearAndMonth(year: string, month: string): Promise<File[]> {
        return this.fileService.findByYearAndMonth(year, month);
    }

    /**
     * 사용자별 파일 조회
     */
    async getFilesByUploadBy(uploadBy: string): Promise<File[]> {
        return this.fileService.findByUploadBy(uploadBy);
    }

    /**
     * 파일 삭제 (S3 및 DB)
     */
    async deleteFile(fileId: string): Promise<void> {
        try {
            this.logger.log(`파일 삭제 시작: ${fileId}`);

            // 1. 파일 엔티티 조회
            const fileEntity = await this.fileService.findOne({ where: { fileId } });
            if (!fileEntity) {
                throw new NotFoundException('파일을 찾을 수 없습니다.');
            }

            // 2. S3에서 파일 삭제
            await this.s3StorageService.deleteFile({
                fileKey: fileEntity.fileName,
            });

            // 3. DB에서 파일 엔티티 삭제
            await this.fileService.delete(fileId);

            this.logger.log(`파일 삭제 완료: ${fileId}`);
        } catch (error) {
            this.logger.error(`파일 삭제 실패: ${error.message}`, error.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`파일 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 엑셀 파일 읽기 (S3 다운로드 + 엑셀 파싱)
     *
     * @param fileId 파일 엔티티 ID
     * @param options 엑셀 읽기 옵션
     * @returns 엑셀 데이터 및 파일 정보
     */
    async readExcelFile(fileId: string, options?: ReadExcelOptionsDto): Promise<ExcelFileReadResult> {
        try {
            this.logger.log(`엑셀 파일 읽기 시작: ${fileId}`);

            // 1. S3에서 파일 다운로드
            const fileContent = await this.readFileContent(fileId);

            // 2. 엑셀 파일인지 확인
            if (!this.isExcelFile(fileContent.contentType)) {
                throw new BadRequestException('엑셀 파일이 아닙니다.');
            }

            // 3. Buffer 검증
            if (!Buffer.isBuffer(fileContent.content)) {
                this.logger.error(`다운로드된 컨텐츠가 Buffer가 아닙니다: ${typeof fileContent.content}`);
                throw new BadRequestException('파일 형식이 올바르지 않습니다.');
            }

            this.logger.log(
                `엑셀 파싱 시작: ${fileId}, 버퍼 크기: ${fileContent.content.length} bytes, 타입: ${fileContent.contentType}`,
            );

            // 4. 엑셀 데이터 파싱
            const excelData = await this.excelReader.readWorksheet(fileContent.content, {
                hasHeader: true,
                ...options,
            });

            this.logger.log(`엑셀 파일 읽기 완료: ${fileId} (${excelData.rowCount}행, ${excelData.columnCount}열)`);

            return {
                fileEntity: fileContent.fileEntity,
                excelData,
                rawContent: fileContent.content,
            };
        } catch (error) {
            this.logger.error(`엑셀 파일 읽기 실패: ${error.message}`, error.stack);

            // 파일 에러 상태로 업데이트
            try {
                await this.fileService.markAsError(fileId, error.message);
            } catch (updateError) {
                this.logger.error(`파일 에러 상태 업데이트 실패: ${updateError.message}`);
            }

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`엑셀 파일 읽기 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 엑셀 파일을 JSON 객체 배열로 읽기 (간편 메서드)
     *
     * @param fileId 파일 엔티티 ID
     * @param options 엑셀 읽기 옵션
     * @returns JSON 객체 배열
     */
    async readExcelAsJson(fileId: string, options?: ReadExcelOptionsDto): Promise<Record<string, any>[]> {
        const result = await this.readExcelFile(fileId, options);

        if (!result.excelData.records) {
            throw new BadRequestException('엑셀 파일에 헤더가 없거나 데이터를 읽을 수 없습니다.');
        }

        return result.excelData.records;
    }

    /**
     * 엑셀 파일의 모든 워크시트 읽기
     *
     * @param fileId 파일 엔티티 ID
     * @param sheetNames 읽을 워크시트 이름 목록 (없으면 전체)
     * @param options 읽기 옵션
     * @returns 워크시트별 데이터
     */
    async readExcelMultipleSheets(
        fileId: string,
        sheetNames?: string[],
        options?: ReadExcelOptionsDto,
    ): Promise<ExcelDataResultDto[]> {
        try {
            this.logger.log(`엑셀 파일의 여러 워크시트 읽기 시작: ${fileId}`);

            // 1. S3에서 파일 다운로드
            const fileContent = await this.readFileContent(fileId);

            // 2. 엑셀 파일인지 확인
            if (!this.isExcelFile(fileContent.contentType)) {
                throw new BadRequestException('엑셀 파일이 아닙니다.');
            }

            // 3. 여러 워크시트 읽기
            const sheets = await this.excelReader.readMultipleWorksheets(fileContent.content, sheetNames, options);

            this.logger.log(`엑셀 워크시트 ${sheets.length}개 읽기 완료: ${fileId}`);

            return sheets;
        } catch (error) {
            this.logger.error(`엑셀 워크시트 읽기 실패: ${error.message}`, error.stack);

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`엑셀 워크시트 읽기 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 엑셀 파일 정보 조회 (워크시트 목록 등)
     *
     * @param fileId 파일 엔티티 ID
     * @returns 엑셀 파일 정보
     */
    async getExcelInfo(fileId: string) {
        try {
            this.logger.log(`엑셀 파일 정보 조회 시작: ${fileId}`);

            // 1. S3에서 파일 다운로드
            const fileContent = await this.readFileContent(fileId);

            // 2. 엑셀 파일인지 확인
            if (!this.isExcelFile(fileContent.contentType)) {
                throw new BadRequestException('엑셀 파일이 아닙니다.');
            }

            // 3. 파일 정보 조회
            const info = await this.excelReader.getFileInfo(fileContent.content);

            this.logger.log(`엑셀 파일 정보 조회 완료: ${fileId}`);

            return {
                fileEntity: fileContent.fileEntity,
                excelInfo: info,
            };
        } catch (error) {
            this.logger.error(`엑셀 파일 정보 조회 실패: ${error.message}`, error.stack);

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`엑셀 파일 정보 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 엑셀 파일 여부 확인
     */
    private isExcelFile(contentType: string): boolean {
        const excelTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ];
        return excelTypes.includes(contentType);
    }

    /**
     * 파일 확장자로 Content-Type 결정
     */
    private getContentType(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            xls: 'application/vnd.ms-excel',
            csv: 'text/csv',
            pdf: 'application/pdf',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
        };
        return mimeTypes[ext || ''] || 'application/octet-stream';
    }
}
