import { Injectable, Logger } from '@nestjs/common';
import { DomainPositionService } from '../../domain/position/position.service';
import { DomainRankService } from '../../domain/rank/rank.service';
import { DomainDepartmentService } from '../../domain/department/department.service';
import { DomainEmployeeService } from '../../domain/employee/employee.service';
import { DomainEmployeeDepartmentPositionService } from '../../domain/employee-department-position/employee-department-position.service';
import axios from 'axios';

/**
 * MetadataSyncContext
 * 메타데이터(조직, 직원 정보) 동기화를 위한 컨텍스트
 * 여러 도메인 서비스를 조합하여 메타데이터 동기화 로직을 구현합니다.
 */
@Injectable()
export class MetadataSyncContext {
    private readonly logger = new Logger(MetadataSyncContext.name);
    private readonly ssoApiUrl: string;

    constructor(
        private readonly positionService: DomainPositionService,
        private readonly rankService: DomainRankService,
        private readonly departmentService: DomainDepartmentService,
        private readonly employeeService: DomainEmployeeService,
        private readonly employeeDepartmentPositionService: DomainEmployeeDepartmentPositionService,
    ) {
        this.ssoApiUrl = process.env.SSO_API_URL || '';
        if (!this.ssoApiUrl) {
            this.logger.warn('SSO_API_URL 환경변수가 설정되지 않았습니다.');
        }
    }

    async onApplicationBootstrap() {
        // // 1. 외부 API에서 메타데이터 조회
        // this.logger.log('외부 API에서 메타데이터 조회 중...');
        // const externalData = await this.fetchAllMetadata();
        // // 2. 컨텍스트를 통해 메타데이터 동기화 실행
        // this.logger.log('메타데이터 동기화 시작...');
        // await this.syncAllMetadata({
        //     positions: externalData.positions || [],
        //     ranks: externalData.ranks || [],
        //     departments: externalData.departments || [],
        //     employees: externalData.employees || [],
        //     employeeDepartmentPositions: externalData.employeeDepartmentPositions || [],
        // });
    }

    /**
     * 외부 API에서 전체 조직 메타데이터를 가져옵니다.
     */
    async fetchAllMetadata(): Promise<any> {
        this.logger.log('외부 API에서 메타데이터 조회 시작');

        try {
            const url = `${this.ssoApiUrl}/api/organization/export/all`;
            this.logger.debug(`API 호출: ${url}`);

            const response = await axios.get(url, {
                timeout: 30000, // 30초 타임아웃
            });

            this.logger.log(
                `메타데이터 조회 완료: ${response.data.totalCounts?.departments || 0}개 부서, ${response.data.totalCounts?.employees || 0}명 직원`,
            );

            return response.data;
        } catch (error) {
            this.logger.error('외부 API에서 메타데이터 조회 실패', error);
            throw new Error(`메타데이터 조회 실패: ${error.message}`);
        }
    }

    /**
     * 직책(Position) 동기화
     */
    async syncPositions(positions: any[]): Promise<void> {
        this.logger.log(`Position 동기화 시작 (${positions.length}개)`);

        for (const position of positions) {
            try {
                const existing = await this.positionService.findOne({ where: { id: position.id } });

                if (existing) {
                    // 업데이트
                    existing.positionTitle = position.positionTitle;
                    existing.positionCode = position.positionCode;
                    existing.level = position.level;
                    existing.hasManagementAuthority = position.hasManagementAuthority;
                    await this.positionService.save(existing);
                    this.logger.debug(`Position 업데이트: ${position.positionTitle}`);
                } else {
                    // 생성
                    const newPosition = await this.positionService.create({
                        id: position.id,
                        positionTitle: position.positionTitle,
                        positionCode: position.positionCode,
                        level: position.level,
                        hasManagementAuthority: position.hasManagementAuthority,
                    });
                    await this.positionService.save(newPosition);
                    this.logger.debug(`Position 생성: ${position.positionTitle}`);
                }
            } catch (error) {
                this.logger.error(`Position 동기화 실패: ${position.positionTitle}`, error);
                throw error;
            }
        }

        this.logger.log('Position 동기화 완료');
    }

    /**
     * 직급(Rank) 동기화
     */
    async syncRanks(ranks: any[]): Promise<void> {
        this.logger.log(`Rank 동기화 시작 (${ranks.length}개)`);

        for (const rank of ranks) {
            try {
                const existing = await this.rankService.findOne({ where: { id: rank.id } });

                if (existing) {
                    // 업데이트
                    existing.rankTitle = rank.rankName;
                    existing.rankCode = rank.rankCode;
                    existing.level = rank.level;
                    await this.rankService.save(existing);
                    this.logger.debug(`Rank 업데이트: ${rank.rankName}`);
                } else {
                    // 생성
                    const newRank = await this.rankService.create({
                        id: rank.id,
                        rankTitle: rank.rankName,
                        rankCode: rank.rankCode,
                        level: rank.level,
                    });
                    await this.rankService.save(newRank);
                    this.logger.debug(`Rank 생성: ${rank.rankName}`);
                }
            } catch (error) {
                this.logger.error(`Rank 동기화 실패: ${rank.rankName}`, error);
                throw error;
            }
        }

        this.logger.log('Rank 동기화 완료');
    }

    /**
     * 부서(Department) 동기화
     * 부모-자식 관계가 있으므로 순서대로 처리
     */
    async syncDepartments(departments: any[]): Promise<void> {
        this.logger.log(`Department 동기화 시작 (${departments.length}개)`);

        // 부모-자식 관계를 고려하여 배치 처리
        const processedIds = new Set<string>();
        let remainingDepartments = [...departments];
        let previousRemainingCount = remainingDepartments.length;

        // 모든 부서가 처리될 때까지 반복
        while (remainingDepartments.length > 0) {
            const currentBatch: any[] = [];

            // 부모가 없거나, 부모가 이미 처리된 부서들을 현재 배치에 추가
            for (const department of remainingDepartments) {
                const canProcess =
                    !department.parentDepartmentId || // 루트 부서
                    processedIds.has(department.parentDepartmentId) || // 부모가 이미 처리됨
                    (await this.departmentService.findOne({ where: { id: department.parentDepartmentId } })); // 부모가 DB에 이미 존재

                if (canProcess) {
                    currentBatch.push(department);
                }
            }

            // 현재 배치가 비어있으면 순환 참조 또는 존재하지 않는 부모 부서
            if (currentBatch.length === 0 && remainingDepartments.length > 0) {
                this.logger.error(
                    `처리 불가능한 부서: ${remainingDepartments.map((d) => `${d.departmentName}(부모: ${d.parentDepartmentId})`).join(', ')}`,
                );
                throw new Error(
                    `부서 동기화 실패: 순환 참조 또는 존재하지 않는 부모 부서 (${remainingDepartments.length}개 부서 미처리)`,
                );
            }

            // 현재 배치 처리
            for (const department of currentBatch) {
                try {
                    const existing = await this.departmentService.findOne({ where: { id: department.id } });

                    if (existing) {
                        // 업데이트
                        existing.departmentName = department.departmentName;
                        existing.departmentCode = department.departmentCode;
                        existing.type = department.type;
                        existing.parentDepartmentId = department.parentDepartmentId;
                        existing.order = department.order;
                        await this.departmentService.save(existing);
                        this.logger.debug(`Department 업데이트: ${department.departmentName}`);
                    } else {
                        // 생성
                        const newDepartment = await this.departmentService.create({
                            id: department.id,
                            departmentName: department.departmentName,
                            departmentCode: department.departmentCode,
                            type: department.type,
                            parentDepartmentId: department.parentDepartmentId,
                            order: department.order,
                        });
                        await this.departmentService.save(newDepartment);
                        this.logger.debug(`Department 생성: ${department.departmentName}`);
                    }

                    processedIds.add(department.id);
                } catch (error) {
                    this.logger.error(`Department 동기화 실패: ${department.departmentName}`, error);
                    throw error;
                }
            }

            // 처리된 부서들을 제거
            remainingDepartments = remainingDepartments.filter((d) => !processedIds.has(d.id));

            // 무한 루프 방지
            previousRemainingCount = remainingDepartments.length;
        }

        this.logger.log('Department 동기화 완료');
    }

    /**
     * 직원(Employee) 동기화
     */
    async syncEmployees(employees: any[]): Promise<void> {
        this.logger.log(`Employee 동기화 시작 (${employees.length}개)`);

        for (const employee of employees) {
            console.log(employee);

            try {
                const existing = await this.employeeService.findOne({ where: { id: employee.id } });
                console.log('existing', existing);
                if (existing) {
                    // 업데이트
                    existing.employeeNumber = employee.employeeNumber;
                    existing.name = employee.name;
                    existing.email = employee.email;
                    existing.password = employee.password;
                    existing.phoneNumber = employee.phoneNumber;
                    existing.dateOfBirth = employee.dateOfBirth;
                    existing.gender = employee.gender;
                    existing.hireDate = employee.hireDate;
                    existing.status = employee.status;
                    existing.currentRankId = employee.currentRankId;
                    existing.terminationDate = employee.terminationDate;
                    existing.terminationReason = employee.terminationReason;
                    existing.isInitialPasswordSet = employee.isInitialPasswordSet;
                    await this.employeeService.save(existing);
                    this.logger.debug(`Employee 업데이트: ${employee.name} (${employee.employeeNumber})`);
                } else {
                    // 생성

                    const newEmployee = await this.employeeService.create({
                        id: employee.id,
                        employeeNumber: employee.employeeNumber,
                        name: employee.name,
                        email: employee.email,
                        password: employee.password,
                        phoneNumber: employee.phoneNumber,
                        dateOfBirth: employee.dateOfBirth,
                        gender: employee.gender,
                        hireDate: employee.hireDate,
                        status: employee.status,
                        currentRankId: employee.currentRankId,
                        terminationDate: employee.terminationDate,
                        terminationReason: employee.terminationReason,
                        isInitialPasswordSet: employee.isInitialPasswordSet,
                        roles: employee.roles || [],
                    });
                    console.log(newEmployee);
                    await this.employeeService.save(newEmployee);
                    this.logger.debug(`Employee 생성: ${employee.name} (${employee.employeeNumber})`);
                }
            } catch (error) {
                this.logger.error(`Employee 동기화 실패: ${employee.name} (${employee.employeeNumber})`, error);
                throw error;
            }
        }

        this.logger.log('Employee 동기화 완료');
    }

    /**
     * 직원-부서-직책(EmployeeDepartmentPosition) 동기화
     */
    async syncEmployeeDepartmentPositions(employeeDepartmentPositions: any[]): Promise<void> {
        this.logger.log(`EmployeeDepartmentPosition 동기화 시작 (${employeeDepartmentPositions.length}개)`);

        for (const edp of employeeDepartmentPositions) {
            try {
                const existing = await this.employeeDepartmentPositionService.findOne({ where: { id: edp.id } });

                if (existing) {
                    // 업데이트
                    existing.employeeId = edp.employeeId;
                    existing.departmentId = edp.departmentId;
                    existing.positionId = edp.positionId;
                    existing.isManager = edp.isManager;
                    await this.employeeDepartmentPositionService.save(existing);
                    this.logger.debug(`EmployeeDepartmentPosition 업데이트: ${edp.id}`);
                } else {
                    // 생성
                    const newEdp = await this.employeeDepartmentPositionService.create({
                        id: edp.id,
                        employeeId: edp.employeeId,
                        departmentId: edp.departmentId,
                        positionId: edp.positionId,
                        isManager: edp.isManager,
                    });
                    await this.employeeDepartmentPositionService.save(newEdp);
                    this.logger.debug(`EmployeeDepartmentPosition 생성: ${edp.id}`);
                }
            } catch (error) {
                this.logger.error(`EmployeeDepartmentPosition 동기화 실패: ${edp.id}`, error);
                continue;
            }
        }

        this.logger.log('EmployeeDepartmentPosition 동기화 완료');
    }

    /**
     * 모든 메타데이터 동기화 (순서 보장)
     */
    async syncAllMetadata(data: {
        positions: any[];
        ranks: any[];
        departments: any[];
        employees: any[];
        employeeDepartmentPositions: any[];
    }): Promise<void> {
        this.logger.log('전체 메타데이터 동기화 시작');

        try {
            // 1. Position 동기화 (다른 엔티티에서 참조하지 않음)
            await this.syncPositions(data.positions);

            // 2. Rank 동기화 (다른 엔티티에서 참조하지 않음)
            await this.syncRanks(data.ranks);

            // 3. Department 동기화
            await this.syncDepartments(data.departments);

            // 4. Employee 동기화 (Rank 참조)
            await this.syncEmployees(data.employees);

            // 5. EmployeeDepartmentPosition 동기화 (Employee, Department, Position 참조)
            await this.syncEmployeeDepartmentPositions(data.employeeDepartmentPositions);

            this.logger.log('전체 메타데이터 동기화 완료');
        } catch (error) {
            this.logger.error('전체 메타데이터 동기화 실패', error);
            throw error;
        }
    }
}
