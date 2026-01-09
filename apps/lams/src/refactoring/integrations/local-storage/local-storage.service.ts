import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
    UploadExcelDto,
    UploadExcelResponseDto,
    GetFileDto,
    GetFileResponseDto,
    DeleteFileDto,
    DeleteFileResponseDto,
    ListFilesDto,
    ListFilesResponseDto,
    FileInfoDto,
} from './dtos/upload-excel.dto';
import {
    EXCEL_MIME_TYPES,
    EXCEL_EXTENSIONS,
    MAX_FILE_SIZE,
    LOCAL_FOLDERS,
    URL_EXPIRATION,
} from './local-storage.constants';
import { IStorageService } from '../storage';

/**
 * 로컬 스토리지 서비스
 *
 * 로컬 파일 시스템을 사용하여 엑셀 파일을 업로드, 다운로드, 삭제 및 관리합니다.
 * 테스트 및 개발 환경에서 사용합니다.
 */
@Injectable()
export class LocalStorageService implements IStorageService {
    private readonly logger = new Logger(LocalStorageService.name);
    private readonly storagePath: string;

    constructor(private readonly configService: ConfigService) {
        // 로컬 저장소 경로 설정
        this.storagePath =
            this.configService.get<string>('LOCAL_STORAGE_PATH') || path.join(process.cwd(), 'storage', 'local-files');

        // 저장소 디렉토리 생성
        this.ensureStorageDirectory();

        this.logger.log(`✅ 로컬 스토리지 서비스 초기화 완료`);
        this.logger.log(`   - Storage Path: ${this.storagePath}`);
    }

    /**
     * 엑셀 파일 업로드
     *
     * @param file 업로드할 파일
     * @param dto 업로드 옵션
     * @returns 업로드 결과
     */
    async uploadExcel(file: Express.Multer.File, dto?: UploadExcelDto): Promise<UploadExcelResponseDto> {
        try {
            // 파일 유효성 검증
            this.validateExcelFile(file);

            // 원본 파일명과 확장자 추출
            const originalFileName = file.originalname;
            const fileExtension = path.extname(originalFileName);

            // 파일 키 생성 (안전한 이름 사용)
            const fileKey = this.generateFileKey(fileExtension, dto?.folder);

            // 로컬 파일 경로 생성
            const filePath = path.join(this.storagePath, fileKey);

            // 디렉토리 생성
            const fileDir = path.dirname(filePath);
            if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true });
            }

            this.logger.log(`파일 업로드 중: ${originalFileName} -> ${fileKey}`);

            // 파일 저장
            fs.writeFileSync(filePath, file.buffer);

            this.logger.log(`파일 업로드 완료: ${fileKey}`);

            // 파일 URL 생성 (로컬 파일 경로)
            const fileUrl = `/storage/${fileKey}`;

            return {
                success: true,
                message: '파일이 성공적으로 업로드되었습니다.',
                fileKey,
                bucket: this.storagePath,
                url: fileUrl,
                uploadedAt: new Date(),
            };
        } catch (error) {
            this.logger.error('파일 업로드 실패', error);
            throw new InternalServerErrorException('파일 업로드 중 오류가 발생했습니다.');
        }
    }

    /**
     * 파일 다운로드 URL 생성
     *
     * @param dto 다운로드 옵션
     * @returns 다운로드 URL
     */
    async getFileDownloadUrl(dto: GetFileDto): Promise<GetFileResponseDto> {
        try {
            // 파일 존재 여부 확인
            await this.validateFileExists(dto.fileKey);

            const expiresIn = dto.expiresIn || URL_EXPIRATION;
            const fileUrl = `/storage/${dto.fileKey}`;

            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

            this.logger.log(`다운로드 URL 생성 완료: ${dto.fileKey}`);

            return {
                url: fileUrl,
                expiresIn,
                expiresAt,
            };
        } catch (error) {
            this.logger.error('다운로드 URL 생성 실패', error);
            throw new InternalServerErrorException('다운로드 URL 생성 중 오류가 발생했습니다.');
        }
    }

    /**
     * 파일 삭제
     *
     * @param dto 삭제 옵션
     * @returns 삭제 결과
     */
    async deleteFile(dto: DeleteFileDto): Promise<DeleteFileResponseDto> {
        try {
            // 파일 존재 여부 확인
            await this.validateFileExists(dto.fileKey);

            const filePath = path.join(this.storagePath, dto.fileKey);
            fs.unlinkSync(filePath);

            this.logger.log(`파일 삭제 완료: ${dto.fileKey}`);

            return {
                success: true,
                message: '파일이 성공적으로 삭제되었습니다.',
                fileKey: dto.fileKey,
            };
        } catch (error) {
            this.logger.error('파일 삭제 실패', error);
            throw new InternalServerErrorException('파일 삭제 중 오류가 발생했습니다.');
        }
    }

    /**
     * 파일 목록 조회
     *
     * @param dto 조회 옵션
     * @returns 파일 목록
     */
    async listFiles(dto?: ListFilesDto): Promise<ListFilesResponseDto> {
        try {
            const prefix = dto?.prefix || LOCAL_FOLDERS.EXCEL;
            const maxKeys = dto?.maxKeys || 100;

            const prefixPath = path.join(this.storagePath, prefix);

            if (!fs.existsSync(prefixPath)) {
                return {
                    files: [],
                    count: 0,
                    prefix,
                };
            }

            const files: FileInfoDto[] = [];
            const items = fs.readdirSync(prefixPath, { withFileTypes: true, recursive: true });

            let count = 0;
            for (const item of items) {
                if (count >= maxKeys) break;

                if (item.isFile()) {
                    const filePath = path.join(item.path, item.name);
                    const relativePath = path.relative(this.storagePath, filePath).replace(/\\/g, '/');
                    const stats = fs.statSync(filePath);

                    files.push({
                        key: relativePath,
                        size: stats.size,
                        lastModified: stats.mtime,
                        etag: crypto.createHash('md5').update(relativePath).digest('hex'),
                    });
                    count++;
                }
            }

            this.logger.log(`파일 목록 조회 완료: ${files.length}개`);

            return {
                files,
                count: files.length,
                prefix,
            };
        } catch (error) {
            this.logger.error('파일 목록 조회 실패', error);
            throw new InternalServerErrorException('파일 목록 조회 중 오류가 발생했습니다.');
        }
    }

    /**
     * 파일 스트림 다운로드 (직접 파일 내용을 가져올 때 사용)
     *
     * @param fileKey 파일 키
     * @returns 파일 스트림
     */
    async downloadFileStream(fileKey: string): Promise<Buffer> {
        try {
            const filePath = path.join(this.storagePath, fileKey);

            if (!fs.existsSync(filePath)) {
                throw new BadRequestException('파일을 찾을 수 없습니다.');
            }

            return fs.readFileSync(filePath);
        } catch (error) {
            this.logger.error('파일 다운로드 실패', error);
            throw new InternalServerErrorException('파일 다운로드 중 오류가 발생했습니다.');
        }
    }

    /**
     * 파일 존재 여부 확인 (boolean 반환)
     */
    async checkFileExists(fileKey: string): Promise<boolean> {
        try {
            const filePath = path.join(this.storagePath, fileKey);
            return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
        } catch (error) {
            this.logger.debug(`파일을 찾을 수 없음: ${fileKey}`);
            return false;
        }
    }

    /**
     * 파일 존재 여부 확인 (예외 발생)
     */
    private async validateFileExists(fileKey: string): Promise<void> {
        const exists = await this.checkFileExists(fileKey);
        if (!exists) {
            throw new BadRequestException('파일을 찾을 수 없습니다.');
        }
    }

    /**
     * 엑셀 파일 유효성 검증
     */
    private validateExcelFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('파일이 제공되지 않았습니다.');
        }

        // 파일 크기 확인
        if (file.size > MAX_FILE_SIZE) {
            throw new BadRequestException(
                `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다.`,
            );
        }

        // 파일 확장자 확인
        const ext = path.extname(file.originalname).toLowerCase();
        if (!EXCEL_EXTENSIONS.includes(ext as any)) {
            throw new BadRequestException(`지원하지 않는 파일 형식입니다. 지원 형식: ${EXCEL_EXTENSIONS.join(', ')}`);
        }

        // MIME 타입 확인
        const validMimeTypes = Object.values(EXCEL_MIME_TYPES);
        if (!validMimeTypes.includes(file.mimetype as any)) {
            throw new BadRequestException(`잘못된 파일 형식입니다. 엑셀 파일(.xlsx, .xls, .csv)만 업로드 가능합니다.`);
        }
    }

    /**
     * 파일 키 생성 (타임스탬프 + UUID + 확장자)
     *
     * @param fileExtension 파일 확장자
     * @param folder 저장 폴더
     * @returns 파일 키
     */
    private generateFileKey(fileExtension: string, folder?: string): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const baseFolder = folder || LOCAL_FOLDERS.EXCEL;

        // 안전한 파일명: 타임스탬프-랜덤문자열.확장자
        return `${baseFolder}/${timestamp}-${randomString}${fileExtension}`;
    }

    /**
     * 저장소 디렉토리 생성
     */
    private ensureStorageDirectory(): void {
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath, { recursive: true });
            this.logger.log(`저장소 디렉토리 생성: ${this.storagePath}`);
        }
    }
}
