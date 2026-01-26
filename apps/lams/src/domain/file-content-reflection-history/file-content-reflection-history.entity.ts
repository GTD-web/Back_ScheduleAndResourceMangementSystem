import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { File } from '../file/file.entity';
import { DataSnapshotInfo } from '../data-snapshot-info/data-snapshot-info.entity';
import { FileContentReflectionHistoryDTO } from './file-content-reflection-history.types';

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
     * 데이터 스냅샷 정보 ID (외래키)
     */
    @Column({ name: 'data_snapshot_info_id', type: 'uuid', nullable: true })
    data_snapshot_info_id: string | null;

    /**
     * 데이터 스냅샷 정보와의 관계
     */
    @ManyToOne(() => DataSnapshotInfo, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'data_snapshot_info_id' })
    data_snapshot_info: DataSnapshotInfo | null;

    /**
     * 부가 정보 (긴 문자열)
     */
    @Column({
        name: 'info',
        type: 'text',
        nullable: true,
        comment: '반영 이력 부가 정보',
    })
    info: string | null;

   
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
        
        data_snapshot_info_id?: string | null,
        info?: string | null,
    ) {
        super();
        this.file_id = file_id;
        this.reflected_at = null;
        this.data_snapshot_info_id = data_snapshot_info_id || null;
        this.info = info || null;
        this.validateInvariants();
    }

    /**
     * 파일 내용 반영 이력 정보를 업데이트한다
     */
    업데이트한다(
        data_snapshot_info_id?: string | null,
        info?: string | null,
    ): void {
        if (data_snapshot_info_id !== undefined) {
            this.data_snapshot_info_id = data_snapshot_info_id;
        }
        if (info !== undefined) {
            this.info = info;
        }
        this.validateInvariants();
    }

    /**
     * 반영 완료 처리
     */
    완료처리한다(): void {
        this.reflected_at = new Date();
    }

  

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): FileContentReflectionHistoryDTO {
        return {
            id: this.id,
            fileId: this.file_id,
            dataSnapshotInfoId: this.data_snapshot_info_id,
            info: this.info,
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
