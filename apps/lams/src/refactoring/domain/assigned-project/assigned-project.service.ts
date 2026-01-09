import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { AssignedProject } from './assigned-project.entity';
import { AssignedProjectDTO, CreateAssignedProjectData, UpdateAssignedProjectData } from './assigned-project.types';

/**
 * 할당된 프로젝트 서비스
 *
 * 할당된 프로젝트 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainAssignedProjectService {
    constructor(
        @InjectRepository(AssignedProject)
        private readonly repository: Repository<AssignedProject>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<AssignedProject> {
        return manager ? manager.getRepository(AssignedProject) : this.repository;
    }

    /**
     * 할당된 프로젝트를 생성한다
     */
    async 생성한다(data: CreateAssignedProjectData, manager?: EntityManager): Promise<AssignedProjectDTO> {
        const repository = this.getRepository(manager);

        // 기존 할당 확인
        const existing = await repository.findOne({
            where: {
                employee_id: data.employeeId,
                project_id: data.projectId,
                deleted_at: IsNull(),
            },
        });
        if (existing) {
            throw new ConflictException('이미 할당된 프로젝트입니다.');
        }

        const assignedProject = new AssignedProject(
            data.employeeId,
            data.projectId,
            data.startDate,
            data.endDate,
            data.isActive !== undefined ? data.isActive : true,
        );

        const saved = await repository.save(assignedProject);
        return saved.DTO변환한다();
    }

    /**
     * ID로 할당된 프로젝트를 조회한다
     */
    async ID로조회한다(id: string): Promise<AssignedProjectDTO> {
        const assignedProject = await this.repository.findOne({
            where: { id },
            relations: ['employee', 'project'],
        });
        if (!assignedProject) {
            throw new NotFoundException(`할당된 프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        return assignedProject.DTO변환한다();
    }

    /**
     * 직원 ID로 할당된 프로젝트 목록을 조회한다
     */
    async 직원ID로조회한다(employeeId: string): Promise<AssignedProjectDTO[]> {
        const assignedProjects = await this.repository.find({
            where: { employee_id: employeeId, deleted_at: IsNull() },
            relations: ['project'],
            order: { created_at: 'DESC' },
        });
        return assignedProjects.map((ap) => ap.DTO변환한다());
    }

    /**
     * 프로젝트 ID로 할당된 직원 목록을 조회한다
     */
    async 프로젝트ID로조회한다(projectId: string): Promise<AssignedProjectDTO[]> {
        const assignedProjects = await this.repository.find({
            where: { project_id: projectId, deleted_at: IsNull() },
            relations: ['employee'],
            order: { created_at: 'DESC' },
        });
        return assignedProjects.map((ap) => ap.DTO변환한다());
    }

    /**
     * 직원-프로젝트 조합으로 조회한다
     */
    async 직원과프로젝트로조회한다(employeeId: string, projectId: string): Promise<AssignedProjectDTO | null> {
        const assignedProject = await this.repository.findOne({
            where: { employee_id: employeeId, project_id: projectId, deleted_at: IsNull() },
            relations: ['employee', 'project'],
        });
        return assignedProject ? assignedProject.DTO변환한다() : null;
    }

    /**
     * 활성화된 할당 목록을 조회한다
     */
    async 활성화된목록조회한다(): Promise<AssignedProjectDTO[]> {
        const assignedProjects = await this.repository.find({
            where: { is_active: true, deleted_at: IsNull() },
            relations: ['employee', 'project'],
            order: { created_at: 'DESC' },
        });
        return assignedProjects.map((ap) => ap.DTO변환한다());
    }

    /**
     * 특정 날짜에 활성화된 할당 목록을 조회한다
     */
    async 날짜로활성화된목록조회한다(date: string): Promise<AssignedProjectDTO[]> {
        const assignedProjects = await this.repository
            .createQueryBuilder('assigned')
            .where('assigned.deleted_at IS NULL')
            .andWhere('assigned.is_active = :isActive', { isActive: true })
            .andWhere('(assigned.start_date IS NULL OR assigned.start_date <= :date)', { date })
            .andWhere('(assigned.end_date IS NULL OR assigned.end_date >= :date)', { date })
            .leftJoinAndSelect('assigned.employee', 'employee')
            .leftJoinAndSelect('assigned.project', 'project')
            .getMany();
        return assignedProjects.map((ap) => ap.DTO변환한다());
    }

    /**
     * 할당된 프로젝트 정보를 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateAssignedProjectData,
        userId: string,
        manager?: EntityManager,
    ): Promise<AssignedProjectDTO> {
        const repository = this.getRepository(manager);
        const assignedProject = await repository.findOne({ where: { id } });
        if (!assignedProject) {
            throw new NotFoundException(`할당된 프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }

        assignedProject.업데이트한다(data.startDate, data.endDate, data.isActive);

        // 수정자 정보 설정
        assignedProject.수정자설정한다(userId);
        assignedProject.메타데이터업데이트한다(userId);

        const saved = await repository.save(assignedProject);
        return saved.DTO변환한다();
    }

    /**
     * 할당된 프로젝트를 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const assignedProject = await repository.findOne({ where: { id } });
        if (!assignedProject) {
            throw new NotFoundException(`할당된 프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        assignedProject.deleted_at = new Date();
        // 삭제자 정보 설정
        assignedProject.수정자설정한다(userId);
        assignedProject.메타데이터업데이트한다(userId);
        await repository.save(assignedProject);
    }

    /**
     * 할당된 프로젝트를 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 할당도 조회할 수 있도록 withDeleted 옵션 사용
        const assignedProject = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!assignedProject) {
            throw new NotFoundException(`할당된 프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(assignedProject);
    }
}
