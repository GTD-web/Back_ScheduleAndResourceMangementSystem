import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as path from 'path';
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
    S3_FOLDERS,
    PRESIGNED_URL_EXPIRATION,
} from './s3-storage.constants';

import { IStorageService } from '../storage';

/**
 * S3 스토리지 서비스
 *
 * AWS S3를 사용하여 엑셀 파일을 업로드, 다운로드, 삭제 및 관리합니다.
 */
@Injectable()
export class S3StorageService implements IStorageService {
    private readonly logger = new Logger(S3StorageService.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly endpoint: string;

    constructor(private readonly configService: ConfigService) {
        // S3 설정 가져오기
        const accessKey = this.configService.get<string>('S3_ACCESS_KEY');
        const secretKey = this.configService.get<string>('S3_SECRET_KEY');

        this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') || '';
        this.endpoint = this.configService.get<string>('S3_ENDPOINT') || '';

        // 환경 변수 검증
        if (!this.bucketName) {
            this.logger.error('❌ S3_BUCKET_NAME 환경 변수가 설정되지 않았습니다.');
        }
        if (!this.endpoint) {
            this.logger.warn('⚠️ S3_ENDPOINT 환경 변수가 설정되지 않았습니다.');
        }
        if (!accessKey) {
            this.logger.error('❌ S3_ACCESS_KEY 환경 변수가 설정되지 않았습니다.');
        }
        if (!secretKey) {
            this.logger.error('❌ S3_SECRET_KEY 환경 변수가 설정되지 않았습니다.');
        }

        // S3 클라이언트 초기화
        this.s3Client = new S3Client({
            region: this.configService.get<string>('S3_REGION') || 'ap-northeast-2',
            endpoint: this.endpoint || undefined,
            credentials: {
                accessKeyId: accessKey || '',
                secretAccessKey: secretKey || '',
            },
            forcePathStyle: true, // MinIO 등 S3 호환 스토리지를 위해 필요
        });

        this.logger.log(`✅ S3 스토리지 서비스 초기화 완료`);
        this.logger.log(`   - Bucket: ${this.bucketName || '❌ 설정 안됨'}`);
        this.logger.log(`   - Endpoint: ${this.endpoint || 'AWS S3 기본'}`);
        this.logger.log(`   - Region: ${this.configService.get<string>('S3_REGION') || 'ap-northeast-2'}`);
        this.logger.log(`   - Access Key: ${accessKey ? accessKey.substring(0, 4) + '****' : '❌ 없음'}`);
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

            // S3 파일 키 생성 (안전한 이름 사용)
            const fileKey = this.generateFileKey(fileExtension, dto?.folder);

            // 메타데이터 준비 (원본 파일명을 Base64로 인코딩하여 저장)
            const metadata = {
                'original-name': Buffer.from(originalFileName, 'utf-8').toString('base64'),
                'upload-date': new Date().toISOString(),
                ...dto?.metadata,
            };

            this.logger.log(`파일 업로드 중: ${originalFileName} -> ${fileKey}`);

            // S3에 업로드
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: metadata,
            });

            await this.s3Client.send(command);

            this.logger.log(`파일 업로드 완료: ${fileKey}`);

            // Presigned URL 생성 (다운로드용)
            const presignedUrl = await this.generatePresignedUrlForDownload(fileKey, PRESIGNED_URL_EXPIRATION);

            return {
                success: true,
                message: '파일이 성공적으로 업로드되었습니다.',
                fileKey,
                bucket: this.bucketName,
                url: presignedUrl,
                uploadedAt: new Date(),
            };
        } catch (error) {
            this.logger.error('파일 업로드 실패', error);
            throw new InternalServerErrorException('파일 업로드 중 오류가 발생했습니다.');
        }
    }

    /**
     * 파일 다운로드 URL 생성 (Presigned URL)
     *
     * @param dto 다운로드 옵션
     * @returns Presigned URL
     */
    async getFileDownloadUrl(dto: GetFileDto): Promise<GetFileResponseDto> {
        try {
            // 파일 존재 여부 확인
            await this.validateFileExists(dto.fileKey);

            const expiresIn = dto.expiresIn || PRESIGNED_URL_EXPIRATION;
            const url = await this.generatePresignedUrlForDownload(dto.fileKey, expiresIn);

            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

            this.logger.log(`다운로드 URL 생성 완료: ${dto.fileKey}`);

            return {
                url,
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

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: dto.fileKey,
            });

            await this.s3Client.send(command);

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
            const prefix = dto?.prefix || S3_FOLDERS.EXCEL;
            const maxKeys = dto?.maxKeys || 100;

            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys,
            });

            const response = await this.s3Client.send(command);

            const files: FileInfoDto[] =
                response.Contents?.map((item) => ({
                    key: item.Key || '',
                    size: item.Size || 0,
                    lastModified: item.LastModified || new Date(),
                    etag: item.ETag || '',
                })) || [];

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
     * S3 파일 키 생성 (타임스탬프 + UUID + 확장자)
     *
     * @param fileExtension 파일 확장자
     * @param folder 저장 폴더
     * @returns S3 파일 키
     */
    private generateFileKey(fileExtension: string, folder?: string): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const baseFolder = folder || S3_FOLDERS.EXCEL;

        // 안전한 파일명: 타임스탬프-랜덤문자열.확장자
        return `${baseFolder}/${timestamp}-${randomString}${fileExtension}`;
    }

    /**
     * 메타데이터에서 원본 파일명 복원
     *
     * @param metadata S3 메타데이터
     * @returns 원본 파일명
     */
    private getOriginalFileName(metadata?: Record<string, string>): string | undefined {
        if (!metadata || !metadata['original-name']) {
            return undefined;
        }

        try {
            return Buffer.from(metadata['original-name'], 'base64').toString('utf-8');
        } catch (error) {
            this.logger.warn('원본 파일명 복원 실패');
            return undefined;
        }
    }

    /**
     * Presigned URL 생성 (다운로드용)
     */
    private async generatePresignedUrlForDownload(fileKey: string, expiresIn: number): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    /**
     * Presigned URL 생성 (업로드용)
     *
     * @param mimeType 파일의 MIME 타입
     * @param fileExtension 파일 확장자 (선택사항)
     * @param expiresIn 만료 시간 (초, 기본값: 2분)
     * @returns Presigned URL 정보
     */
    async generatePresignedUrlForUpload(
        mimeType: string,
        fileExtension?: string,
        expiresIn: number = 120,
    ): Promise<{ url: string; fileKey: string }> {
        try {
            // MIME 타입에서 확장자 추출 (제공되지 않은 경우)
            if (!fileExtension) {
                const mimeTypeMap: Record<string, string> = {
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
                    'application/vnd.ms-excel': 'xls',
                    'text/csv': 'csv',
                    'image/jpeg': 'jpg',
                    'image/png': 'png',
                    'image/webp': 'webp',
                };
                fileExtension = mimeTypeMap[mimeType] || 'bin';
            }

            // 타임스탬프 기반 파일명 생성
            const timestamp = Date.now();
            const milliseconds = String(timestamp).slice(-3);
            const fileKey = `${S3_FOLDERS.EXCEL}/${timestamp}${milliseconds}.${fileExtension}`;

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                ContentType: mimeType,
            });

            const url = await getSignedUrl(this.s3Client, command, { expiresIn });

            this.logger.log(`업로드용 Presigned URL 생성 완료: ${fileKey}`);

            return { url, fileKey };
        } catch (error) {
            this.logger.error('업로드용 Presigned URL 생성 실패', error);
            throw new InternalServerErrorException('업로드용 URL 생성 중 오류가 발생했습니다.');
        }
    }

    /**
     * 파일의 직접 접근 URL 생성 (Public URL)
     * MinIO 등 S3 호환 스토리지에서 public 엔드포인트를 사용하는 경우
     *
     * @param fileKey S3 파일 키
     * @returns 파일의 공개 URL
     */
    getFileUrl(fileKey: string): string {
        // endpoint에서 's3'를 'object/public'으로 변경하여 public URL 생성
        // 예: https://s3.example.com -> https://object/public.example.com
        const publicEndpoint = this.endpoint.replace('s3', 'object/public');
        return `${publicEndpoint}/${this.bucketName}/${fileKey}`;
    }

    /**
     * 파일 존재 여부 확인 (boolean 반환)
     */
    async checkFileExists(fileKey: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });

            const result = await this.s3Client.send(command);
            return result.ContentLength !== undefined && result.ContentLength > 0;
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
     * 파일 스트림 다운로드 (직접 파일 내용을 가져올 때 사용)
     *
     * @param fileKey S3 파일 키
     * @returns 파일 스트림
     */
    async downloadFileStream(fileKey: string): Promise<Buffer> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });

            const response = await this.s3Client.send(command);

            // Stream을 Buffer로 변환
            const stream = response.Body as any;
            const chunks: Buffer[] = [];

            return new Promise((resolve, reject) => {
                stream.on('data', (chunk: Buffer) => chunks.push(chunk));
                stream.on('error', reject);
                stream.on('end', () => resolve(Buffer.concat(chunks)));
            });
        } catch (error) {
            this.logger.error('파일 다운로드 실패', error);
            throw new InternalServerErrorException('파일 다운로드 중 오류가 발생했습니다.');
        }
    }
}
