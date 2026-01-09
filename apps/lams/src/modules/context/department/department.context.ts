import { Injectable, Logger } from '@nestjs/common';
import { DomainDepartmentService } from '../../domain/department/department.service';
import { Department } from '../../domain/department/department.entity';

/**
 * 부서 정보 컨텍스트
 * - 도메인 서비스를 조합하여 부서 정보 관련 비즈니스 로직 처리
 */
@Injectable()
export class DepartmentContext {
    private readonly logger = new Logger(DepartmentContext.name);

    constructor(private readonly domainDepartmentService: DomainDepartmentService) {}

    /**
     * 모든 부서 정보 조회
     * @returns 부서 정보 목록 (정렬 순서대로)
     */
    async getAllDepartments(): Promise<Department[]> {
        this.logger.log('모든 부서 정보 조회 시작');
        const departments = await this.domainDepartmentService
            .createQueryBuilder('department')
            .orderBy('department.order', 'ASC')
            .getMany();
        this.logger.log(`부서 ${departments.length}개 조회 완료`);
        return departments;
    }

    /**
     * 최상위 부서만 조회 (parentDepartmentId가 null인 부서)
     * @returns 최상위 부서 목록
     */
    async getRootDepartments(): Promise<Department[]> {
        this.logger.log('최상위 부서 조회 시작');
        const departments = await this.domainDepartmentService
            .createQueryBuilder('department')
            .where('department.parentDepartmentId IS NULL')
            .orderBy('department.order', 'ASC')
            .getMany();
        this.logger.log(`최상위 부서 ${departments.length}개 조회 완료`);
        return departments;
    }

    /**
     * 특정 부서의 하위 부서 조회
     * @param parentDepartmentId - 상위 부서 ID
     * @returns 하위 부서 목록
     */
    async getChildDepartments(parentDepartmentId: string): Promise<Department[]> {
        this.logger.log(`부서 ${parentDepartmentId}의 하위 부서 조회 시작`);
        const departments = await this.domainDepartmentService
            .createQueryBuilder('department')
            .where('department.parentDepartmentId = :parentDepartmentId', { parentDepartmentId })
            .orderBy('department.order', 'ASC')
            .getMany();
        this.logger.log(`하위 부서 ${departments.length}개 조회 완료`);
        return departments;
    }

    /**
     * ID로 부서 정보 조회
     * @param departmentId - 부서 ID
     * @returns 부서 정보
     */
    async getDepartmentById(departmentId: string): Promise<Department> {
        return await this.domainDepartmentService.findOne({ where: { id: departmentId } });
    }

    /**
     * 부서 코드로 부서 정보 조회
     * @param departmentCode - 부서 코드
     * @returns 부서 정보
     */
    async getDepartmentByCode(departmentCode: string): Promise<Department | null> {
        const departments = await this.domainDepartmentService.findAll({
            where: { departmentCode },
        });
        return departments.length > 0 ? departments[0] : null;
    }
}
