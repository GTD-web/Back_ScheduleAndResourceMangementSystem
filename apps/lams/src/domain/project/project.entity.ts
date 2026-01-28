import { Entity, Column, Index } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { BaseEntity } from '@libs/database/base/base.entity';
import { ProjectDTO } from './project.types';

/**
 * 프로젝트 엔티티
 *
 * 근무분야의 프로젝트 정보를 관리하는 엔티티
 */
@Entity('projects')
@Index(['project_code'], { unique: true })
export class Project extends BaseEntity<ProjectDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공
    /**
     * 프로젝트 코드
     * 고유한 프로젝트 식별 코드
     */
    @Column({
        name: 'project_code',
        type: 'varchar',
        length: 100,
        unique: true,
        comment: '프로젝트 코드',
    })
    project_code: string;

    /**
     * 프로젝트명
     */
    @Column({
        name: 'project_name',
        type: 'varchar',
        length: 255,
        comment: '프로젝트명',
    })
    project_name: string;

    /**
     * 프로젝트 설명
     */
    @Column({
        name: 'description',
        type: 'text',
        nullable: true,
        comment: '프로젝트 설명',
    })
    description: string | null;

    /**
     * 시작일
     */
    @Column({
        name: 'start_date',
        type: 'date',
        nullable: true,
        comment: '시작일',
    })
    start_date: string | null;

    /**
     * 종료일
     */
    @Column({
        name: 'end_date',
        type: 'date',
        nullable: true,
        comment: '종료일',
    })
    end_date: string | null;

    /**
     * 활성화 여부
     */
    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
        comment: '활성화 여부',
    })
    is_active: boolean;

    /**
     * 프로젝트 불변성 검증
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
        if (!this.project_code || !this.project_name) {
            return;
        }

        if (this.project_code.trim().length === 0) {
            throw new BadRequestException('프로젝트 코드는 필수입니다.');
        }

        if (this.project_name.trim().length === 0) {
            throw new BadRequestException('프로젝트명은 필수입니다.');
        }
    }

    /**
     * 데이터 형식 검증
     */
    private validateDataFormat(): void {
        // TypeORM 메타데이터 검증 단계에서는 검증을 건너뜀
        if (!this.project_code || !this.project_name) {
            return;
        }

        if (this.project_code.length > 100) {
            throw new BadRequestException('프로젝트 코드는 100자 이하여야 합니다.');
        }

        if (this.project_name.length > 255) {
            throw new BadRequestException('프로젝트명은 255자 이하여야 합니다.');
        }
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 시작일과 종료일 검증
        if (this.start_date && this.end_date) {
            if (new Date(this.start_date) > new Date(this.end_date)) {
                throw new BadRequestException('시작일은 종료일보다 이전이어야 합니다.');
            }
        }
    }

    /**
     * 프로젝트를 생성한다
     */
    constructor(
        project_code: string,
        project_name: string,
        description?: string,
        start_date?: string,
        end_date?: string,
        is_active: boolean = true,
    ) {
        super();
        this.project_code = project_code;
        this.project_name = project_name;
        this.description = description || null;
        this.start_date = start_date || null;
        this.end_date = end_date || null;
        this.is_active = is_active;
        this.validateInvariants();
    }

    /**
     * 프로젝트 정보를 업데이트한다
     */
    업데이트한다(
        project_code?: string,
        project_name?: string,
        description?: string,
        start_date?: string,
        end_date?: string,
        is_active?: boolean,
    ): void {
        if (project_code !== undefined) {
            this.project_code = project_code;
        }
        if (project_name !== undefined) {
            this.project_name = project_name;
        }
        if (description !== undefined) {
            this.description = description;
        }
        if (start_date !== undefined) {
            this.start_date = start_date;
        }
        if (end_date !== undefined) {
            this.end_date = end_date;
        }
        if (is_active !== undefined) {
            this.is_active = is_active;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): ProjectDTO {
        return {
            id: this.id,
            projectCode: this.project_code,
            projectName: this.project_name,
            description: this.description,
            startDate: this.start_date,
            endDate: this.end_date,
            isActive: this.is_active,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
