import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DomainEmployeeService } from '../../domain/employee/employee.service';
import { DomainDepartmentService } from '../../domain/department/department.service';
import { DomainDepartmentEmployeeService } from '../../domain/department-employee/department-employee.service';
import { Role } from '../../../libs/enums/role-type.enum';
import { In, IsNull, Not, Raw } from 'typeorm';
import { EmployeeResponseDto } from '../../business/employee-management/dtos/employee-response.dto';
import { EmplyeesByDepartmentResponseDto } from '../../business/employee-management/dtos/employees-by-department-response.dto';
import { UserResponseDto } from '../../business/employee-management/dtos/user-response.dto';
import { ChangeRoleDto } from '../../business/employee-management/dtos/change-role.dto';
import { UpdateNotificationSettingsDto } from '../../business/employee-management/dtos/notification-settings.dto';
import { ERROR_MESSAGE } from '../../../libs/constants/error-message';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
import { Employee } from '../../../libs/entities/employee.entity';
import { EmployeeMicroserviceAdapter } from '../../domain/employee/adapters/employee-microservice.adapter';
import { DepartmentMicroserviceAdapter } from '../../domain/department/adapters/department-microservice.adapter';
import { DepartmentHierarchyResponseDto } from '../../domain/department/dtos/department-response.dto';

@Injectable()
export class EmployeeContextService {
    private readonly logger = new Logger(EmployeeContextService.name);

    constructor(
        private readonly domainEmployeeService: DomainEmployeeService,
        private readonly employeeMicroserviceAdapter: EmployeeMicroserviceAdapter,
        private readonly domainDepartmentService: DomainDepartmentService,
        private readonly domainDepartmentEmployeeService: DomainDepartmentEmployeeService,
        private readonly departmentMicroserviceAdapter: DepartmentMicroserviceAdapter,
    ) {}

    async 시스템관리자_목록을_조회한다(): Promise<Employee[]> {
        const systemAdmins = await this.domainEmployeeService.findAll({
            where: {
                roles: Raw(() => `'${Role.SYSTEM_ADMIN}' = ANY("roles")`),
            },
        });
        return systemAdmins;
    }

    /**
     * 자원 관리자 목록을 부서별로 조회한다
     */
    async 자원관리자_목록을_조회한다(): Promise<EmplyeesByDepartmentResponseDto[]> {
        const resourceManagers = await this.domainEmployeeService.findAll({
            where: {
                roles: Raw(() => `'${Role.RESOURCE_ADMIN}' = ANY("roles")`),
                department: Not(In(['관리자'])),
                status: Not(In(['퇴사'])),
            },
            select: {
                employeeId: true,
                name: true,
                employeeNumber: true,
                department: true,
                position: true,
                rank: true,
                positionTitle: true,
                status: true,
            },
        });

        return this.부서별로_그룹핑한다(resourceManagers);
    }

    /**
     * 관리자 후보 목록을 부서별로 조회한다
     */
    async 관리자_후보_목록을_조회한다(): Promise<EmplyeesByDepartmentResponseDto[]> {
        const candidates = await this.domainEmployeeService.findAll({
            where: {
                department: Not(In(['관리자'])),
                status: Not(In(['퇴사'])),
            },
            select: {
                employeeId: true,
                name: true,
                employeeNumber: true,
                department: true,
                position: true,
                rank: true,
                positionTitle: true,
                roles: true,
            },
        });

        const candidatesWithRole = candidates.map((candidate) => ({
            ...candidate,
            isResourceAdmin: candidate.roles.includes(Role.RESOURCE_ADMIN),
        }));

        return this.부서별로_그룹핑한다(candidatesWithRole);
    }

    /**
     * 직원 목록을 부서별로 조회한다
     */
    async 직원_목록을_조회한다(useHiddenInFilter: boolean = false): Promise<EmplyeesByDepartmentResponseDto[]> {
        const isHiddenInFilter = useHiddenInFilter ? { isHiddenInFilter: false } : {};
        const employees = await this.domainEmployeeService.findAll({
            where: {
                department: Not(In(['관리자'])),
                status: Not(In(['퇴사'])),
                ...isHiddenInFilter,
            },
            select: {
                employeeId: true,
                name: true,
                employeeNumber: true,
                department: true,
                position: true,
                rank: true,
                positionTitle: true,
                status: true,
            },
        });

        return this.부서별로_그룹핑한다(employees);
    }

    /**
     * 직원 상세 정보를 조회한다
     */
    async 직원_상세정보를_조회한다(employeeId: string): Promise<UserResponseDto> {
        const employee = await this.domainEmployeeService.findByEmployeeId(employeeId);
        if (!employee) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.AUTH.USER_NOT_FOUND);
        }

        return {
            employeeId: employee.employeeId,
            employeeNumber: employee.employeeNumber,
            email: employee.email,
            mobile: employee.mobile,
            name: employee.name,
            department: employee.department,
            position: employee.position,
            rank: employee.rank,
            positionTitle: employee.positionTitle,
            roles: employee.roles,
            isPushNotificationEnabled: employee.isPushNotificationEnabled,
        };
    }

    /**
     * 복수 직원 ID들로 직원 정보를 조회한다
     */
    async 복수_직원정보를_조회한다(employeeIds: string[]): Promise<Employee[]> {
        return await this.domainEmployeeService.findAll({
            where: { employeeId: In(employeeIds) },
            relations: ['departmentEmployees', 'departmentEmployees.department'],
        });
    }

    /**
     * 비밀번호를 확인한다
     */
    async 비밀번호를_확인한다(employeeId: string, password: string): Promise<boolean> {
        const employee = await this.domainEmployeeService.findByEmployeeId(employeeId);
        if (!employee) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.AUTH.USER_NOT_FOUND);
        }

        try {
            const ssoApiUrl = process.env.SSO_API_URL;
            const response = await axios.post(
                `${ssoApiUrl}/api/auth/check-password`,
                {
                    currentPassword: password,
                },
                {
                    headers: {
                        Authorization: `Bearer ${employee.accessToken}`,
                    },
                },
            );
            const data = response.data;
            return data.isValid;
        } catch (error) {
            console.log(error);
            throw new UnauthorizedException(ERROR_MESSAGE.BUSINESS.AUTH.SSO_LOGIN_FAILED);
        }
    }

    /**
     * 비밀번호를 변경한다
     */
    async 비밀번호를_변경한다(employeeId: string, password: string): Promise<void> {
        const employee = await this.domainEmployeeService.findByEmployeeId(employeeId);
        if (!employee) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.AUTH.USER_NOT_FOUND);
        }

        try {
            const ssoApiUrl = process.env.SSO_API_URL;
            const response = await axios.post(
                `${ssoApiUrl}/api/auth/change-password`,
                {
                    newPassword: password,
                },
                {
                    headers: {
                        Authorization: `Bearer ${employee.accessToken}`,
                    },
                },
            );
            const data = response.data;
            console.log(data);
            employee.password = await bcrypt.hash(password, 10);
            await this.domainEmployeeService.update(employee.employeeId, employee);
        } catch (error) {
            console.log(error);
            throw new UnauthorizedException(ERROR_MESSAGE.BUSINESS.AUTH.SSO_LOGIN_FAILED);
        }
    }

    /**
     * 직원의 역할을 변경한다
     */
    async 직원_역할을_변경한다(changeRoleDto: ChangeRoleDto): Promise<void> {
        const employee = await this.domainEmployeeService.findByEmployeeId(changeRoleDto.employeeId);
        if (!employee) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.AUTH.USER_NOT_FOUND);
        }

        employee.roles = changeRoleDto.isResourceAdmin
            ? [...employee.roles, Role.RESOURCE_ADMIN]
            : employee.roles.filter((role) => role !== Role.RESOURCE_ADMIN);

        await this.domainEmployeeService.update(employee.employeeId, employee);
    }

    /**
     * 알림 설정을 변경한다
     */
    async 알림설정을_변경한다(employeeId: string, updateDto: UpdateNotificationSettingsDto): Promise<UserResponseDto> {
        const employee = await this.domainEmployeeService.findByEmployeeId(employeeId);
        if (!employee) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.AUTH.USER_NOT_FOUND);
        }

        employee.isPushNotificationEnabled = updateDto.isPushNotificationEnabled;
        await this.domainEmployeeService.update(employee.employeeId, employee);

        return this.직원_상세정보를_조회한다(employeeId);
    }

    /**
     * 모든 부서 목록을 조회합니다
     */
    async 모든_부서를_조회한다(): Promise<any[]> {
        try {
            const departments = await this.domainDepartmentService.findAll();

            return departments.map((dept) => ({
                id: dept.id,
                departmentName: dept.departmentName,
                departmentCode: dept.departmentCode,
                type: dept.type,
                parentDepartmentId: dept.parentDepartmentId,
                order: dept.order,
                createdAt: dept.createdAt,
                updatedAt: dept.updatedAt,
            }));
        } catch (error) {
            this.logger.error('부서 목록 조회 실패:', error);
            return [];
        }
    }

    /**
     * 하위 부서 목록만 조회합니다 (부모 부서가 있는 부서들)
     */
    async 하위_부서_목록을_조회한다(): Promise<any[]> {
        try {
            // parentDepartmentId가 null이 아닌 부서들만 조회
            const departments = await this.domainDepartmentService.findAll({
                where: {
                    parentDepartmentId: Not(IsNull()),
                },
                order: {
                    order: 'ASC',
                },
            });

            this.logger.log(`하위 부서 목록 조회 완료: ${departments.length}개 부서`);

            return departments.map((dept) => ({
                id: dept.id,
                departmentName: dept.departmentName,
                departmentCode: dept.departmentCode,
                type: dept.type,
                parentDepartmentId: dept.parentDepartmentId,
                order: dept.order,
                createdAt: dept.createdAt,
                updatedAt: dept.updatedAt,
            }));
        } catch (error) {
            this.logger.error('하위 부서 목록 조회 실패:', error);
            return [];
        }
    }

    /**
     * 루트 부서 목록만 조회합니다 (부모 부서가 없는 부서들)
     */
    async 루트_부서_목록을_조회한다(): Promise<any[]> {
        try {
            // parentDepartmentId가 null인 부서들만 조회
            const departments = await this.domainDepartmentService.findAll({
                where: {
                    parentDepartmentId: IsNull(),
                },
                order: {
                    order: 'ASC',
                },
            });

            this.logger.log(`루트 부서 목록 조회 완료: ${departments.length}개 부서`);

            return departments.map((dept) => ({
                id: dept.id,
                departmentName: dept.departmentName,
                departmentCode: dept.departmentCode,
                type: dept.type,
                parentDepartmentId: dept.parentDepartmentId,
                order: dept.order,
                createdAt: dept.createdAt,
                updatedAt: dept.updatedAt,
            }));
        } catch (error) {
            this.logger.error('루트 부서 목록 조회 실패:', error);
            return [];
        }
    }

    /**
     * 부서 계층구조를 트리 형태로 조회합니다
     */
    async 부서_계층구조를_조회한다(): Promise<any[]> {
        try {
            // 모든 부서 조회
            const allDepartments = await this.모든_부서를_조회한다();

            // 루트 부서들 찾기
            const rootDepartments = allDepartments.filter((dept) => !dept.parentDepartmentId);

            // 각 루트 부서에 대해 하위 부서들을 재귀적으로 연결
            const buildHierarchy = (parentDept: any): any => {
                const children = allDepartments
                    .filter((dept) => dept.parentDepartmentId === parentDept.id)
                    .map((child) => buildHierarchy(child))
                    .sort((a, b) => a.order - b.order);

                return {
                    ...parentDept,
                    childDepartments: children,
                    childDepartmentCount: children.length,
                };
            };

            const hierarchy = rootDepartments.map((root) => buildHierarchy(root)).sort((a, b) => a.order - b.order);

            this.logger.log(
                `부서 계층구조 조회 완료: 루트 ${rootDepartments.length}개, 전체 ${allDepartments.length}개 부서`,
            );

            return hierarchy;
        } catch (error) {
            this.logger.error('부서 계층구조 조회 실패:', error);
            return [];
        }
    }

    /**
     * 직원 목록을 부서별로 그룹핑한다 (데이터 가공만, 조회 안함)
     */
    private 부서별로_그룹핑한다(employees: any[]): EmplyeesByDepartmentResponseDto[] {
        const departments = new Map<string, EmployeeResponseDto[]>();

        employees.forEach((employee) => {
            if (!departments.has(employee.department)) {
                departments.set(employee.department, []);
            }
            departments.get(employee.department)?.push(employee);
        });

        return Array.from(departments.entries()).map(([department, employees]) => ({
            department,
            employees,
        }));
    }

    /**
     * 외부 시스템에서 직원 정보를 조회한다
     */
    async 직원_정보를_동기화한다(authorization: string): Promise<EmplyeesByDepartmentResponseDto[]> {
        const { employees, total } = await this.employeeMicroserviceAdapter.getAllEmployees(authorization);
        for (const employee of employees) {
            const existingEmployee = await this.domainEmployeeService.findByEmployeeNumber(employee.employeeNumber);

            if (employee.status === '퇴사') {
                if (existingEmployee) {
                    await this.domainEmployeeService.update(existingEmployee.employeeId, {
                        department: employee.department
                            ? employee.department.departmentName
                            : existingEmployee.department,
                        position: employee.rank?.rankName || null,
                        rank: employee.rank?.rankName || null,
                        positionTitle: employee.position?.positionTitle || null,
                        status: employee.status,
                    });
                }
                continue;
            }

            try {
                if (existingEmployee) {
                    existingEmployee.name = employee.name;
                    existingEmployee.employeeNumber = employee.employeeNumber;
                    existingEmployee.department = employee.department.departmentName;
                    existingEmployee.position = employee.rank?.rankName || null;
                    existingEmployee.rank = employee.rank?.rankName || null;
                    existingEmployee.positionTitle = employee.position?.positionTitle || null;
                    existingEmployee.mobile = employee.phoneNumber;
                    existingEmployee.status = employee.status;
                    await this.domainEmployeeService.save(existingEmployee);
                } else {
                    const employeeData = {
                        employeeNumber: employee.employeeNumber,
                        name: employee.name,
                        email: employee.email,
                        department: employee.department.departmentName,
                        position: employee.rank?.rankName || null,
                        rank: employee.rank?.rankName || null,
                        positionTitle: employee.position?.positionTitle || null,
                        mobile: employee.phoneNumber,
                        status: employee.status,
                    };
                    const newEmployee = await this.domainEmployeeService.create(employeeData);
                    await this.domainEmployeeService.save(newEmployee);
                }
            } catch (error) {
                console.log(error);
            }
        }
        return this.직원_목록을_조회한다();
    }

    /**
     * 외부 시스템에서 부서 정보를 동기화하고 직원을 배치합니다
     */
    async 부서_정보를_동기화한다(): Promise<DepartmentHierarchyResponseDto> {
        try {
            this.logger.log('외부 시스템에서 부서 및 직원 배치 정보 동기화 시작...');

            // 외부 시스템에서 부서 계층구조 데이터 가져오기
            const departmentHierarchy = await this.departmentMicroserviceAdapter.fetchDepartmentHierarchy();

            // 1단계: 모든 부서를 평면적으로 수집
            const allDepartments = this.모든_부서를_평면적으로_수집한다(departmentHierarchy.departments);

            // 2단계: 부서 정보 저장 (parentDepartmentId 없이)
            const departmentIdMapping = await this.모든_부서를_저장한다(allDepartments);

            // 3단계: 부서 간 관계 설정
            await this.부서_관계를_설정한다(allDepartments, departmentIdMapping);

            // 4단계: 외부 시스템에 없는 부서 삭제
            await this.외부_시스템에_없는_부서를_삭제한다(allDepartments);

            this.logger.log(
                `부서 및 직원 배치 정보 동기화 완료: 총 ${departmentHierarchy.totalDepartments}개 부서, ${departmentHierarchy.totalEmployees}명 직원`,
            );

            return departmentHierarchy;
        } catch (error) {
            this.logger.error('부서 및 직원 배치 정보 동기화 실패:', error);
            throw error;
        }
    }

    /**
     * 계층구조를 평면적인 배열로 변환합니다
     */
    private 모든_부서를_평면적으로_수집한다(departments: any[]): any[] {
        const allDepartments: any[] = [];

        const collectRecursively = (depts: any[]) => {
            for (const dept of depts) {
                allDepartments.push(dept);
                if (dept.childDepartments && dept.childDepartments.length > 0) {
                    collectRecursively(dept.childDepartments);
                }
            }
        };

        collectRecursively(departments);
        return allDepartments;
    }

    /**
     * 모든 부서를 parentDepartmentId 없이 저장합니다
     */
    private async 모든_부서를_저장한다(allDepartments: any[]): Promise<Map<string, string>> {
        const departmentIdMapping = new Map<string, string>(); // 외부ID -> 내부ID 매핑

        for (const dept of allDepartments) {
            try {
                // 기존 부서 확인
                const existingDepartment = await this.domainDepartmentService.findOne({
                    where: { departmentCode: dept.departmentCode } as any,
                });

                let savedDepartment;

                if (!existingDepartment) {
                    // 새 부서 생성 (parentDepartmentId 없이)
                    const departmentData = {
                        departmentName: dept.departmentName,
                        departmentCode: dept.departmentCode,
                        type: dept.type,
                        order: dept.order,
                    };

                    const createdDepartment = await this.domainDepartmentService.create(departmentData);
                    savedDepartment = await this.domainDepartmentService.save(createdDepartment);

                    this.logger.log(`새 부서 생성: ${dept.departmentName} (${dept.departmentCode})`);
                } else {
                    // 기존 부서 업데이트 (parentDepartmentId 제외)
                    existingDepartment.departmentName = dept.departmentName;
                    existingDepartment.type = dept.type;
                    existingDepartment.order = dept.order;

                    savedDepartment = await this.domainDepartmentService.save(existingDepartment);

                    this.logger.log(`부서 업데이트: ${dept.departmentName} (${dept.departmentCode})`);
                }

                // 외부 ID와 내부 ID 매핑 저장
                departmentIdMapping.set(dept.id, savedDepartment.id);
            } catch (error) {
                this.logger.error(`부서 저장 실패: ${dept.departmentName} (${dept.departmentCode})`, error);
            }
        }

        return departmentIdMapping;
    }

    /**
     * 부서 간 관계를 설정합니다
     */
    private async 부서_관계를_설정한다(allDepartments: any[], departmentIdMapping: Map<string, string>): Promise<void> {
        for (const dept of allDepartments) {
            try {
                // 상위 부서가 있는 경우에만 관계 설정
                if (dept.parentDepartmentId) {
                    const internalDepartmentId = departmentIdMapping.get(dept.id);
                    const internalParentId = departmentIdMapping.get(dept.parentDepartmentId);

                    if (internalDepartmentId && internalParentId) {
                        // 부서 업데이트 (parentDepartmentId 설정)
                        await this.domainDepartmentService.update(internalDepartmentId, {
                            parentDepartmentId: internalParentId,
                        });

                        this.logger.log(`부서 관계 설정: ${dept.departmentName} → 상위부서 ID: ${internalParentId}`);
                    } else {
                        this.logger.warn(
                            `부서 관계 설정 실패: 매핑되지 않은 ID - 부서: ${dept.id}, 상위부서: ${dept.parentDepartmentId}`,
                        );
                    }
                }
            } catch (error) {
                this.logger.error(`부서 관계 설정 실패: ${dept.departmentName}`, error);
            }
        }
    }

    /**
     * 외부 시스템에 없는 부서를 삭제합니다
     */
    private async 외부_시스템에_없는_부서를_삭제한다(externalDepartments: any[]): Promise<void> {
        try {
            // 외부 시스템의 부서 코드 목록 수집
            const externalDepartmentCodes = new Set(externalDepartments.map((dept) => dept.departmentCode));

            // 현재 DB의 모든 부서 조회
            const currentDepartments = await this.domainDepartmentService.findAll();

            // 삭제할 부서 찾기 (외부 시스템에 없는 부서)
            const departmentsToDelete = currentDepartments.filter(
                (dept) => !externalDepartmentCodes.has(dept.departmentCode),
            );

            if (departmentsToDelete.length > 0) {
                this.logger.log(`삭제할 부서 ${departmentsToDelete.length}개 발견`);

                // 부서 삭제
                for (const dept of departmentsToDelete) {
                    try {
                        await this.domainDepartmentService.delete(dept.id);
                        this.logger.log(`부서 삭제 완료: ${dept.departmentName} (${dept.departmentCode})`);
                    } catch (error) {
                        this.logger.error(`부서 삭제 실패: ${dept.departmentName} (${dept.departmentCode})`, error);
                    }
                }

                this.logger.log(`외부 시스템에 없는 부서 삭제 완료: ${departmentsToDelete.length}개`);
            } else {
                this.logger.log('삭제할 부서 없음');
            }
        } catch (error) {
            this.logger.error('외부 시스템에 없는 부서 삭제 실패:', error);
            throw error;
        }
    }

    /**
     * 각 부서의 직원 배치 정보를 저장합니다
     */
    private async 직원_배치_정보를_저장한다(departments: any[]): Promise<void> {
        try {
            // 기존 부서-직원 관계 데이터 모두 삭제 (동기화를 위해)
            this.logger.log('기존 부서-직원 관계 데이터 삭제 시작...');

            // 모든 기존 관계 데이터를 실제로 삭제
            const existingRelations = await this.domainDepartmentEmployeeService.findAll();

            for (const relation of existingRelations) {
                await this.domainDepartmentEmployeeService.delete(relation.id);
            }

            this.logger.log(`기존 부서-직원 관계 ${existingRelations.length}개 삭제 완료`);
        } catch (error) {
            this.logger.error('기존 부서-직원 관계 데이터 삭제 실패:', error);
            throw error;
        }

        // 모든 부서를 평면적으로 수집
        const allDepartments = this.모든_부서를_평면적으로_수집한다(departments);

        for (const dept of allDepartments) {
            try {
                // 부서 정보 조회
                const department = await this.domainDepartmentService.findOne({
                    where: { departmentCode: dept.departmentCode } as any,
                });

                if (!department) {
                    this.logger.warn(`부서를 찾을 수 없음: ${dept.departmentCode}`);
                    continue;
                }

                // 새로운 직원 배치
                for (const emp of dept.employees || []) {
                    try {
                        // employeeNumber로 기존 직원 조회
                        const employee = await this.domainEmployeeService.findByEmployeeNumber(emp.employeeNumber);

                        if (!employee) {
                            this.logger.warn(`직원을 찾을 수 없음: ${emp.employeeNumber} (${emp.name})`);
                            continue;
                        }

                        // 부서-직원 관계 생성
                        const relationData = {
                            departmentId: department.id,
                            employeeId: employee.employeeId,
                            isManager: false, // 필요시 외부 데이터에서 매핑
                            startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
                            isActive: true,
                        };

                        const relation = await this.domainDepartmentEmployeeService.create(relationData);
                        await this.domainDepartmentEmployeeService.save(relation);

                        this.logger.log(`직원 배치 완료: ${emp.name} (${emp.employeeNumber}) → ${dept.departmentName}`);
                    } catch (error) {
                        this.logger.error(`직원 배치 실패: ${emp.employeeNumber} (${emp.name})`, error);
                    }
                }
            } catch (error) {
                this.logger.error(`부서 직원 배치 실패: ${dept.departmentName}`, error);
            }
        }
    }

    /**
     * 직원 정보와 부서 정보를 모두 동기화합니다
     */
    async 전체_조직_정보를_동기화한다(authorization: string): Promise<EmplyeesByDepartmentResponseDto[]> {
        try {
            this.logger.log('전체 조직 정보 동기화 시작...');

            // 1. 부서 정보 동기화
            const departmentHierarchy = await this.부서_정보를_동기화한다();

            // 2. 직원 정보 동기화
            await this.직원_정보를_동기화한다(authorization);

            // 3단계: 직원 배치 정보 저장
            await this.직원_배치_정보를_저장한다(departmentHierarchy.departments);

            this.logger.log('전체 조직 정보 동기화 완료');
            return this.직원_목록을_조회한다();
        } catch (error) {
            this.logger.error('전체 조직 정보 동기화 실패:', error);
            throw error;
        }
    }

    async 구독정보를_동기화한다(): Promise<void> {
        const employees = await this.domainEmployeeService.findAll({
            where: {
                subscriptions: Not(IsNull()),
                department: Not(In(['관리자'])),
                status: Not(In(['퇴사'])),
            },
        });
        let count = 1;
        for (const employee of employees) {
            const response = await this.employeeMicroserviceAdapter.subscribeFcm('', employee.employeeNumber, {
                fcmToken: employee.subscriptions[0].fcm?.token,
            });
            if (response.success) {
                console.log('구독 정보 동기화 성공', count, employee.name, employee.employeeNumber);
                count++;
            }
        }
    }

    /**
     * 특정 부서와 하위 부서의 모든 직원 목록을 조회합니다
     */
    async 부서별_직원_목록을_조회한다(departmentId: string): Promise<Employee[]> {
        try {
            // 1. 해당 부서와 모든 하위 부서 ID 수집
            const allDepartmentIds = await this.부서와_하위부서_ID들을_수집한다(departmentId);

            this.logger.log(`부서 ${departmentId}와 하위 부서들: [${allDepartmentIds.join(', ')}]`);

            // 2. 모든 부서의 직원들 조회
            const departmentEmployees = await this.domainDepartmentEmployeeService.findAll({
                where: {
                    departmentId: In(allDepartmentIds), // 여러 부서 ID로 조회
                },
                relations: ['employee'],
            });

            // 3. 직원 정보만 추출하여 반환 (중복 제거)
            const employeeMap = new Map();
            departmentEmployees.forEach((de) => {
                if (de.employee && de.employee.employeeId) {
                    employeeMap.set(de.employee.employeeId, de.employee);
                }
            });

            const employees = Array.from(employeeMap.values());

            this.logger.log(`부서별 직원 목록 조회 완료: 부서 ${departmentId} (하위 부서 포함), ${employees.length}명`);
            return employees;
        } catch (error) {
            this.logger.error(`부서별 직원 목록 조회 실패: 부서 ${departmentId}`, error);
            return [];
        }
    }

    /**
     * 특정 부서와 모든 하위 부서의 ID를 재귀적으로 수집합니다
     */
    private async 부서와_하위부서_ID들을_수집한다(departmentId: string): Promise<string[]> {
        const result = [departmentId]; // 자기 자신 포함

        try {
            // 모든 부서 조회
            const allDepartments = await this.domainDepartmentService.findAll();

            // 재귀적으로 하위 부서 찾기
            const findSubDepartments = (parentId: string): string[] => {
                const subDepartments = allDepartments.filter((dept) => dept.parentDepartmentId === parentId);
                const subIds: string[] = [];

                for (const subDept of subDepartments) {
                    subIds.push(subDept.id);
                    // 재귀적으로 하위 부서의 하위 부서도 찾기
                    subIds.push(...findSubDepartments(subDept.id));
                }

                return subIds;
            };

            const subDepartmentIds = findSubDepartments(departmentId);
            result.push(...subDepartmentIds);

            return [...new Set(result)]; // 중복 제거
        } catch (error) {
            this.logger.error(`하위 부서 ID 수집 실패: ${departmentId}`, error);
            return [departmentId]; // 실패 시 자기 자신만 반환
        }
    }

    /**
     * 재직중인 전체 직원 목록을 조회합니다
     */
    async 재직중인_전체_직원을_조회한다(): Promise<Employee[]> {
        try {
            // resignedAt이 null인 모든 직원 조회
            const employees = await this.domainEmployeeService.findAll({
                where: {
                    status: '재직중',
                },
            });

            this.logger.log(`재직중인 전체 직원 조회 완료: ${employees.length}명`);
            return employees;
        } catch (error) {
            this.logger.error('재직중인 전체 직원 조회 실패:', error);
            return [];
        }
    }
}
