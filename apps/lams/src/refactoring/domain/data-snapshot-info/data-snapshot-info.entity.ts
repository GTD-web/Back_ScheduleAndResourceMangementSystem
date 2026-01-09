import { Entity, Column, ManyToOne, JoinColumn, OneToMany, AfterLoad } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { DataSnapshotChild } from '../data-snapshot-child/data-snapshot-child.entity';
import { Department } from '@libs/modules/department/department.entity';
import { DataSnapshotInfoDTO, SnapshotType } from './data-snapshot-info.types';

/**
 * 데이터 스냅샷 정보 엔티티
 */
@Entity('data_snapshot_info')
export class DataSnapshotInfo extends BaseEntity<DataSnapshotInfoDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    @Column({
        name: 'snapshot_name',
        comment: '스냅샷명',
    })
    snapshot_name: string;

    @Column({
        name: 'description',
        default: '',
        comment: '설명',
    })
    description: string;

    @Column({
        name: 'snapshot_type',
        type: 'text',
        comment: '스냅샷 타입',
    })
    snapshot_type: SnapshotType;

    @Column({
        name: 'yyyy',
        comment: '연도',
    })
    yyyy: string;

    @Column({
        name: 'mm',
        comment: '월',
    })
    mm: string;

    @Column({ name: 'department_id', type: 'uuid' })
    department_id: string;

    @OneToMany(() => DataSnapshotChild, (child) => child.parentSnapshot, {
        cascade: ['insert', 'update', 'remove'],
    })
    dataSnapshotChildInfoList: DataSnapshotChild[];

    @ManyToOne(() => Department)
    @JoinColumn({ name: 'department_id' })
    department: Department;

    /**
     * 데이터 스냅샷 정보 불변성 검증
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
        if (!this.snapshot_name || !this.snapshot_type || !this.yyyy || !this.mm || !this.department_id) {
            return;
        }

        if (this.snapshot_name.trim().length === 0) {
            throw new Error('스냅샷명은 필수입니다.');
        }

        if (this.yyyy.trim().length === 0) {
            throw new Error('연도는 필수입니다.');
        }

        if (this.mm.trim().length === 0) {
            throw new Error('월은 필수입니다.');
        }

        this.validateUuidFormat(this.department_id, 'department_id');
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
     * 데이터 스냅샷 정보를 생성한다
     */
    constructor(
        snapshot_name: string,
        snapshot_type: SnapshotType,
        yyyy: string,
        mm: string,
        department_id: string,
        description: string = '',
    ) {
        super();
        this.snapshot_name = snapshot_name;
        this.snapshot_type = snapshot_type;
        this.yyyy = yyyy;
        this.mm = mm;
        this.department_id = department_id;
        this.description = description;
        this.validateInvariants();
    }

    /**
     * 데이터 스냅샷 정보를 업데이트한다
     */
    업데이트한다(snapshot_name?: string, description?: string): void {
        if (snapshot_name !== undefined) {
            this.snapshot_name = snapshot_name;
        }
        if (description !== undefined) {
            this.description = description;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): DataSnapshotInfoDTO {
        return {
            id: this.id,
            snapshotName: this.snapshot_name,
            description: this.description,
            snapshotType: this.snapshot_type,
            yyyy: this.yyyy,
            mm: this.mm,
            departmentId: this.department_id,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }

    /**
     * AfterLoad 훅: 데이터 로드 후 처리
     */
    @AfterLoad()
    로드후처리한다(): void {
        // createdAt을 한국 시간으로 포맷팅
        if (this.created_at) {
            (this as any).createdAt = new Date(this.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        }

        // 자식 스냅샷 목록을 직원명으로 정렬
        if (this.dataSnapshotChildInfoList) {
            this.dataSnapshotChildInfoList.sort((a, b) => a.employee_name.localeCompare(b.employee_name, 'ko'));
        }
    }
}
