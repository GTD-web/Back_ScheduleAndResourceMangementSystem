import { Entity, Column, ManyToOne, JoinColumn, AfterLoad } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { DataSnapshotInfo } from '../data-snapshot-info/data-snapshot-info.entity';
import { Employee } from '@libs/modules/employee/employee.entity';
import { DataSnapshotChildDTO, ParentDataType } from './data-snapshot-child.types';

/**
 * 데이터 스냅샷 자식 엔티티
 */
@Entity('data_snapshot_child')
export class DataSnapshotChild extends BaseEntity<DataSnapshotChildDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    @Column({ name: 'employee_id', type: 'uuid' })
    employee_id: string;

    /**
     * 직원 엔티티와의 관계
     */
    @ManyToOne(() => Employee, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    @Column({
        name: 'employee_name',
        comment: '직원명',
    })
    employee_name: string;

    @Column({
        name: 'employee_number',
        comment: '직원번호',
    })
    employee_number: string;

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

    @Column({ name: 'snapshot_data', type: 'json' })
    snapshot_data: string;

    @Column({
        name: 'raw_data',
        type: 'jsonb',
        nullable: true,
        comment: '스냅샷 원본 데이터 (해당 직원의 eventInfo, usedAttendance)',
    })
    raw_data: Record<string, any> | null;

    @ManyToOne(() => DataSnapshotInfo, (snapshot) => snapshot.dataSnapshotChildInfoList, { onDelete: 'CASCADE' })
    parentSnapshot: DataSnapshotInfo;

    /**
     * 데이터 스냅샷 자식 불변성 검증
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
        if (!this.employee_id || !this.employee_name || !this.employee_number || !this.yyyy || !this.mm) {
            return;
        }

        if (this.employee_name.trim().length === 0) {
            throw new Error('직원명은 필수입니다.');
        }

        if (this.employee_number.trim().length === 0) {
            throw new Error('직원번호는 필수입니다.');
        }

        if (this.yyyy.trim().length === 0) {
            throw new Error('연도는 필수입니다.');
        }

        if (this.mm.trim().length === 0) {
            throw new Error('월은 필수입니다.');
        }

        this.validateUuidFormat(this.employee_id, 'employee_id');
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
     * 데이터 스냅샷 자식을 생성한다
     */
    constructor(
        employee_id: string,
        employee_name: string,
        employee_number: string,
        yyyy: string,
        mm: string,
        snapshot_data: string,
        raw_data: Record<string, any> | null = null,
    ) {
        super();
        this.employee_id = employee_id;
        this.employee_name = employee_name;
        this.employee_number = employee_number;
        this.yyyy = yyyy;
        this.mm = mm;
        this.snapshot_data = snapshot_data;
        this.raw_data = raw_data;
        this.validateInvariants();
    }

    /**
     * 데이터 스냅샷 자식 정보를 업데이트한다
     */
    업데이트한다(
        employee_name?: string,
        employee_number?: string,
        snapshot_data?: string,
        raw_data?: Record<string, any> | null,
    ): void {
        if (employee_name !== undefined) {
            this.employee_name = employee_name;
        }
        if (employee_number !== undefined) {
            this.employee_number = employee_number;
        }
        if (snapshot_data !== undefined) {
            this.snapshot_data = snapshot_data;
        }
        if (raw_data !== undefined) {
            this.raw_data = raw_data;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): DataSnapshotChildDTO {
        return {
            id: this.id,
            employeeId: this.employee_id,
            employeeName: this.employee_name,
            employeeNumber: this.employee_number,
            yyyy: this.yyyy,
            mm: this.mm,
            snapshotData: this.snapshot_data,
            rawData: this.raw_data,
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
        // snapshot_data를 JSON으로 파싱
        if (typeof this.snapshot_data === 'string') {
            try {
                this.snapshot_data = JSON.parse(this.snapshot_data) as any;
            } catch (error) {
                // JSON 파싱 실패 시 원본 유지
            }
        }
        // raw_data는 JSONB 타입이므로 자동으로 파싱됨 (추가 처리 불필요)
    }

    /**
     * 부모 데이터로부터 자식 스냅샷 목록을 생성한다 (정적 팩토리 메서드)
     */
    static 부모데이터로부터생성한다(snapshotData: ParentDataType[]): DataSnapshotChild[] {
        return snapshotData.map((data) => {
            const dataSnapshotChild = new DataSnapshotChild(
                data.employeeId,
                data.employeeName,
                data.employeeNumber,
                data.yyyymm.slice(0, 4),
                data.yyyymm.slice(5, 7),
                JSON.stringify(data),
            );
            return dataSnapshotChild;
        });
    }
}
