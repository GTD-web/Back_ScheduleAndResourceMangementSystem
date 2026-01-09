import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { FileDTO, FileStatus } from './file.types';

/**
 * 파일 엔티티
 */
@Entity('file')
export class File extends BaseEntity<FileDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    @Column({
        name: 'file_name',
        comment: '파일명',
    })
    file_name: string;

    @Column({
        name: 'file_original_name',
        nullable: true,
        comment: '원본 파일명',
    })
    file_original_name: string | null;

    @Column({
        name: 'file_path',
        comment: '파일 경로',
    })
    file_path: string;

    @Column({
        name: 'year',
        nullable: true,
        comment: '연도',
    })
    year: string | null;

    @Column({
        name: 'month',
        nullable: true,
        comment: '월',
    })
    month: string | null;

    @Column({
        name: 'read_at',
        nullable: true,
        comment: '읽은 시간',
    })
    read_at: string | null;

    @Column({
        name: 'status',
        type: 'enum',
        enum: FileStatus,
        default: FileStatus.UNREAD,
        comment: '파일 상태',
    })
    status: FileStatus;

    @Column({
        name: 'error',
        nullable: true,
        comment: '에러 메시지',
    })
    error: string | null;

    /**
     * 파일 내용 데이터 (JSONB)
     * 파일을 읽은 후 가공한 데이터
     */
    @Column({
        name: 'data',
        type: 'jsonb',
        nullable: true,
        comment: '파일 내용 데이터',
    })
    data: Record<string, any> | null;

    /**
     * 파일 불변성 검증
     */
    private validateInvariants(): void {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }

    /**
     * 필수 데이터 검증
     */
    private validateRequiredData(): void {
        // TypeORM 메타데이터 검증 단계에서는 검증을 건너뜀
        if (!this.file_name || !this.file_path) {
            return;
        }

        if (this.file_name.trim().length === 0) {
            throw new Error('파일명은 필수입니다.');
        }

        if (this.file_path.trim().length === 0) {
            throw new Error('파일 경로는 필수입니다.');
        }
    }

    /**
     * 데이터 형식 검증
     */
    private validateDataFormat(): void {
        // 추가적인 형식 검증이 필요한 경우 여기에 구현
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 추가적인 논리적 검증이 필요한 경우 여기에 구현
    }

    /**
     * 파일을 생성한다
     */
    constructor(
        file_name: string,
        file_path: string,
        file_original_name?: string,
        year?: string,
        month?: string,
        data?: Record<string, any>,
    ) {
        super();
        this.file_name = file_name;
        this.file_path = file_path;
        this.file_original_name = file_original_name || null;
        this.year = year || null;
        this.month = month ? month.padStart(2, '0') : null;
        this.status = FileStatus.UNREAD;
        this.read_at = null;
        this.error = null;
        this.data = data || null;
        this.validateInvariants();
    }

    /**
     * 파일 정보를 업데이트한다
     */
    업데이트한다(
        file_name?: string,
        file_original_name?: string,
        file_path?: string,
        year?: string,
        month?: string,
        status?: FileStatus,
        error?: string,
        data?: Record<string, any>,
    ): void {
        if (file_name !== undefined) {
            this.file_name = file_name;
        }
        if (file_original_name !== undefined) {
            this.file_original_name = file_original_name;
        }
        if (file_path !== undefined) {
            this.file_path = file_path;
        }
        if (year !== undefined) {
            this.year = year;
        }
        if (month !== undefined) {
            this.month = month.padStart(2, '0');
        }
        if (status !== undefined) {
            this.status = status;
        }
        if (error !== undefined) {
            this.error = error;
        }
        if (data !== undefined) {
            this.data = data;
        }
        this.validateInvariants();
    }

    /**
     * 파일 읽음 처리
     */
    읽음처리한다(): void {
        this.read_at = new Date().toISOString();
        this.status = FileStatus.READ;
    }

    /**
     * 파일 에러 처리
     */
    에러처리한다(error: any): void {
        this.read_at = new Date().toISOString();
        this.status = FileStatus.ERROR;
        this.error = typeof error === 'string' ? error : JSON.stringify(error);
    }

    /**
     * 연도/월 설정
     */
    연도월설정한다(year: string, month: string): void {
        this.year = year;
        this.month = month.padStart(2, '0');
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): FileDTO {
        return {
            id: this.id,
            fileName: this.file_name,
            fileOriginalName: this.file_original_name,
            filePath: this.file_path,
            year: this.year,
            month: this.month,
            readAt: this.read_at,
            status: this.status,
            error: this.error,
            data: this.data,
            uploadBy: this.created_by || '',
            uploadedAt: this.created_at,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
