import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { File } from '../file/file.entity';
import { FileContentReflectionHistoryDTO, ReflectionStatus, ReflectionType } from './file-content-reflection-history.types';

/**
 * 파일 내용 반영 이력 엔티티
 *
 * 파일 업로드 후 내용이 반영되는 과정을 추적하는 이력 테이블
 */
@Entity('file_content_reflection_history')
@Index(['file_id', 'created_at'])
export class FileContentReflectionHistory extends BaseEntity<FileContentReflectionHistoryDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    /**
     * 파일 ID (외래키)
     */
    @Column({ name: 'file_id', type: 'uuid' })
    file_id: string;

    /**
     * 파일 엔티티와의 관계
     */
    @ManyToOne(() => File, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'file_id' })
    file: File;

    /**
     * 반영 상태
     */
    @Column({
        name: 'status',
        type: 'enum',
        enum: ReflectionStatus,
        default: ReflectionStatus.PENDING,
        comment: '반영 상태',
    })
    status: ReflectionStatus;

    /**
     * 반영 타입
     */
    @Column({
        name: 'type',
        type: 'enum',
        enum: ReflectionType,
        default: ReflectionType.OTHER,
        comment: '반영 타입',
    })
    type: ReflectionType;

    /**
     * 반영 데이터 (JSONB)
     * 파일 내용을 파싱한 결과 데이터
     */
    @Column({
        name: 'data',
        type: 'jsonb',
        nullable: true,
        comment: '반영 데이터',
    })
    data: Record<string, any> | null;

    /**
     * 반영일자
     * 실제로 데이터가 반영된 시점
     */
    @Column({
        name: 'reflected_at',
        type: 'timestamp',
        nullable: true,
        comment: '반영일자',
    })
    reflected_at: Date | null;

    /**
     * 파일 내용 반영 이력 불변성 검증
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
        if (!this.file_id) {
            return;
        }

        this.validateUuidFormat(this.file_id, 'file_id');
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
     * 파일 내용 반영 이력을 생성한다
     */
    constructor(
        file_id: string,
        type: ReflectionType,
        data?: Record<string, any>,
        status: ReflectionStatus = ReflectionStatus.PENDING,
    ) {
        super();
        this.file_id = file_id;
        this.type = type;
        this.data = data || null;
        this.status = status;
        this.reflected_at = null;
        this.validateInvariants();
    }

    /**
     * 파일 내용 반영 이력 정보를 업데이트한다
     */
    업데이트한다(status?: ReflectionStatus, data?: Record<string, any>): void {
        if (status !== undefined) {
            this.status = status;
        }
        if (data !== undefined) {
            this.data = data;
        }
        this.validateInvariants();
    }

    /**
     * 반영 완료 처리
     */
    완료처리한다(): void {
        this.status = ReflectionStatus.COMPLETED;
        this.reflected_at = new Date();
    }

    /**
     * 반영 실패 처리
     */
    실패처리한다(): void {
        this.status = ReflectionStatus.FAILED;
    }

    /**
     * 처리 중 상태로 변경
     */
    처리중처리한다(): void {
        this.status = ReflectionStatus.PROCESSING;
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): FileContentReflectionHistoryDTO {
        return {
            id: this.id,
            fileId: this.file_id,
            status: this.status,
            type: this.type,
            data: this.data,
            createdAt: this.created_at,
            reflectedAt: this.reflected_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
