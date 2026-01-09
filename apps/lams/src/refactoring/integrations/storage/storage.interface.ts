import {
    UploadExcelDto,
    UploadExcelResponseDto,
    GetFileDto,
    GetFileResponseDto,
    DeleteFileDto,
    DeleteFileResponseDto,
    ListFilesDto,
    ListFilesResponseDto,
} from '../s3-storage/dtos/upload-excel.dto';

/**
 * 스토리지 서비스 공통 인터페이스
 *
 * S3StorageService와 LocalStorageService가 구현하는 공통 인터페이스입니다.
 */
export interface IStorageService {
    /**
     * 엑셀 파일 업로드
     */
    uploadExcel(file: Express.Multer.File, dto?: UploadExcelDto): Promise<UploadExcelResponseDto>;

    /**
     * 파일 다운로드 URL 생성
     */
    getFileDownloadUrl(dto: GetFileDto): Promise<GetFileResponseDto>;

    /**
     * 파일 삭제
     */
    deleteFile(dto: DeleteFileDto): Promise<DeleteFileResponseDto>;

    /**
     * 파일 목록 조회
     */
    listFiles(dto?: ListFilesDto): Promise<ListFilesResponseDto>;

    /**
     * 파일 스트림 다운로드
     */
    downloadFileStream(fileKey: string): Promise<Buffer>;

    /**
     * 파일 존재 여부 확인
     */
    checkFileExists(fileKey: string): Promise<boolean>;
}
