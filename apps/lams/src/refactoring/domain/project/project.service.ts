import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectData, UpdateProjectData, ProjectDTO } from './project.types';

/**
 * 프로젝트 서비스
 *
 * 프로젝트 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly repository: Repository<Project>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<Project> {
        return manager ? manager.getRepository(Project) : this.repository;
    }

    /**
     * 프로젝트를 생성한다
     */
    async 생성한다(data: CreateProjectData, manager?: EntityManager): Promise<ProjectDTO> {
        const repository = this.getRepository(manager);

        // 프로젝트 코드 중복 검증
        const existingProject = await repository.findOne({
            where: { project_code: data.projectCode, deleted_at: IsNull() },
        });
        if (existingProject) {
            throw new ConflictException(`이미 존재하는 프로젝트 코드입니다. (code: ${data.projectCode})`);
        }

        const project = new Project(
            data.projectCode,
            data.projectName,
            data.description,
            data.startDate,
            data.endDate,
            data.isActive !== undefined ? data.isActive : true,
        );

        const saved = await repository.save(project);
        return saved.DTO변환한다();
    }

    /**
     * ID로 프로젝트를 조회한다
     */
    async ID로조회한다(id: string): Promise<ProjectDTO> {
        const project = await this.repository.findOne({ where: { id } });
        if (!project) {
            throw new NotFoundException(`프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        return project.DTO변환한다();
    }

    /**
     * 프로젝트 코드로 조회한다
     */
    async 코드로조회한다(projectCode: string): Promise<ProjectDTO | null> {
        const project = await this.repository.findOne({
            where: { project_code: projectCode, deleted_at: IsNull() },
        });
        return project ? project.DTO변환한다() : null;
    }

    /**
     * 프로젝트 목록을 조회한다
     */
    async 목록조회한다(): Promise<ProjectDTO[]> {
        const projects = await this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        });
        return projects.map((project) => project.DTO변환한다());
    }

    /**
     * 활성화된 프로젝트 목록을 조회한다
     */
    async 활성화된목록조회한다(): Promise<ProjectDTO[]> {
        const projects = await this.repository.find({
            where: { is_active: true, deleted_at: IsNull() },
            order: { project_name: 'ASC' },
        });
        return projects.map((project) => project.DTO변환한다());
    }

    /**
     * 프로젝트명으로 검색한다
     */
    async 이름으로검색한다(keyword: string): Promise<ProjectDTO[]> {
        const projects = await this.repository
            .createQueryBuilder('project')
            .where('project.deleted_at IS NULL')
            .andWhere('(project.project_name LIKE :keyword OR project.project_code LIKE :keyword)', {
                keyword: `%${keyword}%`,
            })
            .orderBy('project.project_name', 'ASC')
            .getMany();
        return projects.map((project) => project.DTO변환한다());
    }

    /**
     * 프로젝트 정보를 수정한다
     */
    async 수정한다(id: string, data: UpdateProjectData, userId: string, manager?: EntityManager): Promise<ProjectDTO> {
        const repository = this.getRepository(manager);
        const project = await repository.findOne({ where: { id } });
        if (!project) {
            throw new NotFoundException(`프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }

        // 프로젝트 코드 변경 시 중복 검증
        if (data.projectCode && data.projectCode !== project.project_code) {
            const existingProject = await repository.findOne({
                where: { project_code: data.projectCode, deleted_at: IsNull() },
            });
            if (existingProject) {
                throw new ConflictException(`이미 존재하는 프로젝트 코드입니다. (code: ${data.projectCode})`);
            }
        }

        project.업데이트한다(
            data.projectCode,
            data.projectName,
            data.description,
            data.startDate,
            data.endDate,
            data.isActive,
        );

        // 수정자 정보 설정
        project.수정자설정한다(userId);
        project.메타데이터업데이트한다(userId);

        const saved = await repository.save(project);
        return saved.DTO변환한다();
    }

    /**
     * 프로젝트를 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const project = await repository.findOne({ where: { id } });
        if (!project) {
            throw new NotFoundException(`프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        project.deleted_at = new Date();
        // 삭제자 정보 설정
        project.수정자설정한다(userId);
        project.메타데이터업데이트한다(userId);
        await repository.save(project);
    }

    /**
     * 프로젝트를 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 프로젝트도 조회할 수 있도록 withDeleted 옵션 사용
        const project = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!project) {
            throw new NotFoundException(`프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(project);
    }
}
