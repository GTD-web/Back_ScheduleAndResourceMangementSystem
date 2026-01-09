import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Employee } from '@libs/entities';
import { EmployeeService } from '@resource/modules/employee/application/services/employee.service';
import { EmployeeRepository } from '@resource/modules/employee/infrastructure/adapters/out/persistence/employee.repository';
import { getTestDbConfig, closeTestContainer } from '../test-db.config';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('Employee Service Integration Test', () => {
    let moduleRef: TestingModule;
    let employeeService: EmployeeService;
    const TEST_ID = 'employee-service-test';

    beforeAll(async () => {
        const dbConfig = await getTestDbConfig(TEST_ID);

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                }),
                TypeOrmModule.forRoot({
                    ...dbConfig,
                    autoLoadEntities: true,
                }),
                TypeOrmModule.forFeature([Employee]),
            ],
            providers: [
                EmployeeService,
                {
                    provide: 'EmployeeRepositoryPort',
                    useClass: EmployeeRepository,
                },
            ],
        }).compile();

        employeeService = moduleRef.get<EmployeeService>(EmployeeService);
    });

    afterAll(async () => {
        await moduleRef.close();
        await closeTestContainer(TEST_ID);
    });

    describe('findAllEmplyeesByDepartment', () => {
        it('should return employees grouped by department', async () => {
            const result = await employeeService.findAllEmplyeesByDepartment();

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);

            // 시드 데이터에 있는 부서들이 포함되어 있는지 확인
            const departments = result.map((item) => item.department);
            expect(departments).toContain('Web파트');
            expect(departments).toContain('경영지원실');

            // 각 부서별 직원 데이터 확인
            const webDept = result.find((item) => item.department === 'Web파트');
            const adminDept = result.find((item) => item.department === '경영지원실');

            expect(webDept).toBeDefined();
            expect(adminDept).toBeDefined();

            // Web파트 직원 수 확인 (시드 데이터 기준)
            expect(webDept.employees.length).toBeGreaterThan(0);

            // 직원 데이터 구조 확인
            const employee = webDept.employees[0];
            expect(employee).toHaveProperty('employeeId');
            expect(employee).toHaveProperty('name');
            expect(employee).toHaveProperty('employeeNumber');
            expect(employee).toHaveProperty('department');
            expect(employee).toHaveProperty('position');
        });
    });
});
