import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { HolidayInfoDTO } from './holiday-info.types';

/**
 * 휴일 정보 엔티티
 */
@Entity('holiday_info')
export class HolidayInfo extends BaseEntity<HolidayInfoDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    @Column({
        name: 'holiday_name',
        comment: '휴일명',
    })
    holiday_name: string;

    @Column({
        name: 'holiday_date',
        comment: '휴일 날짜',
    })
    holiday_date: string;

    /**
     * 휴일 정보 불변성 검증
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
        if (!this.holiday_name || !this.holiday_date) {
            return;
        }

        if (this.holiday_name.trim().length === 0) {
            throw new Error('휴일명은 필수입니다.');
        }

        if (this.holiday_date.trim().length === 0) {
            throw new Error('휴일 날짜는 필수입니다.');
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
     * 휴일 정보를 생성한다
     */
    constructor(holiday_name: string, holiday_date: string) {
        super();
        this.holiday_name = holiday_name;
        this.holiday_date = holiday_date;
        this.validateInvariants();
    }

    /**
     * 휴일 정보를 업데이트한다
     */
    업데이트한다(holiday_name?: string, holiday_date?: string): void {
        if (holiday_name !== undefined) {
            this.holiday_name = holiday_name;
        }
        if (holiday_date !== undefined) {
            this.holiday_date = holiday_date;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): HolidayInfoDTO {
        return {
            id: this.id,
            holidayName: this.holiday_name,
            holidayDate: this.holiday_date,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
