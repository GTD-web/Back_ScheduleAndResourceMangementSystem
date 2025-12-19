import { Injectable, Logger } from '@nestjs/common';
import { FileContextService } from '../../context/file/services/file.context.service';
import { FileResponseDto } from '../../business.dto.index';
import { MimeType } from '../../../libs/enums/mime-type.enum';
import { CreateFileDataDto } from './dtos';

/**
 * 파일 관리 비즈니스 서비스
 *
 * 파일 관련 비즈니스 로직을 처리합니다:
 * - 파일 업로드/다운로드/삭제 관리
 * - 다중 파일 처리
 * - Presigned URL 생성
 * - 파일 데이터 관리
 * - 임시 파일 정리
 *
 * 특징:
 * - Context layer의 파일 서비스 orchestration
 * - 비즈니스 규칙 적용 및 검증
 * - 파일 처리 플로우 관리
 */
@Injectable()
export class FileManagementService {
    private readonly logger = new Logger(FileManagementService.name);

    constructor(private readonly fileContextService: FileContextService) {}

    /**
     * 파일 업로드
     * @param file 업로드할 파일
     * @returns 업로드된 파일 정보
     */
    async uploadFile(file: Express.Multer.File): Promise<FileResponseDto> {
        this.logger.log(`파일 업로드 시작: ${file.originalname}`);

        try {
            const result = await this.fileContextService.파일을_업로드한다(file);
            this.logger.log(`파일 업로드 완료: ${result.fileId}`);
            return result;
        } catch (error) {
            this.logger.error(`파일 업로드 실패: ${file.originalname}`, error);
            throw error;
        }
    }

    /**
     * 다중 파일 업로드
     * @param files 업로드할 파일들
     * @returns 업로드된 파일들 정보
     */
    async uploadMultipleFiles(files: Express.Multer.File[]): Promise<FileResponseDto[]> {
        this.logger.log(`다중 파일 업로드 시작: ${files.length}개 파일`);

        try {
            const result = await this.fileContextService.다중_파일을_업로드한다(files);
            this.logger.log(`다중 파일 업로드 완료: ${result.length}개 파일`);
            return result;
        } catch (error) {
            this.logger.error(`다중 파일 업로드 실패`, error);
            throw error;
        }
    }

    /**
     * 파일 삭제
     * @param fileId 삭제할 파일 ID
     */
    async deleteFile(fileId: string): Promise<void> {
        this.logger.log(`파일 삭제 시작: ${fileId}`);

        try {
            await this.fileContextService.파일을_삭제한다(fileId);
            this.logger.log(`파일 삭제 완료: ${fileId}`);
        } catch (error) {
            this.logger.error(`파일 삭제 실패: ${fileId}`, error);
            throw error;
        }
    }

    /**
     * 다중 파일 삭제
     * @param fileIds 삭제할 파일 ID들
     */
    async deleteMultipleFiles(fileIds: string[]): Promise<void> {
        this.logger.log(`다중 파일 삭제 시작: ${fileIds.length}개 파일`);

        try {
            await this.fileContextService.다중_파일을_삭제한다(fileIds);
            this.logger.log(`다중 파일 삭제 완료: ${fileIds.length}개 파일`);
        } catch (error) {
            this.logger.error(`다중 파일 삭제 실패`, error);
            throw error;
        }
    }

    /**
     * Presigned URL 생성
     * @param mime MIME 타입
     * @returns Presigned URL 정보
     */
    async getPresignedUrl(mime: MimeType): Promise<any> {
        this.logger.log(`Presigned URL 생성 시작: ${mime}`);

        try {
            const result = await this.fileContextService.프리사인드_URL을_생성한다(mime);
            this.logger.log(`Presigned URL 생성 완료`);
            return result;
        } catch (error) {
            this.logger.error(`Presigned URL 생성 실패: ${mime}`, error);
            throw error;
        }
    }

    /**
     * 파일 데이터 생성
     * @param createFileDataDto 파일 데이터 생성 정보
     * @returns 생성된 파일 정보
     */
    async createFileData(createFileDataDto: CreateFileDataDto): Promise<FileResponseDto> {
        this.logger.log(`파일 데이터 생성 시작`);

        try {
            const result = await this.fileContextService.파일_데이터를_생성한다(createFileDataDto);
            this.logger.log(`파일 데이터 생성 완료: ${result.fileId}`);
            return result;
        } catch (error) {
            this.logger.error(`파일 데이터 생성 실패`, error);
            throw error;
        }
    }

    /**
     * 임시 파일들 삭제 (크론 작업용)
     * @returns 삭제 결과
     */
    async deleteTemporaryFiles(): Promise<any> {
        this.logger.log(`임시 파일들 삭제 시작`);

        try {
            const result = await this.fileContextService.임시_파일들을_삭제한다();
            this.logger.log(`임시 파일들 삭제 완료`);
            return result;
        } catch (error) {
            this.logger.error(`임시 파일들 삭제 실패`, error);
            throw error;
        }
    }
}
