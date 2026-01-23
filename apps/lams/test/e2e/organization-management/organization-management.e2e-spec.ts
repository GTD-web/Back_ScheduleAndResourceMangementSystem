import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Department, DepartmentType } from '../../../../../libs/modules/department/department.entity';
import { TestSetup } from '../utils/test-setup';
import { TestHelpers } from '../utils/test-helpers';
import { TestDataBuilder } from '../utils/test-data-builder';
import * as request from 'supertest';

describe('OrganizationManagementController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let testData: TestDataBuilder;
    let testDepartmentId: string | null = null;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        // JwtService를 사용하여 실제 유효한 토큰 생성
        authToken = TestHelpers.createValidJwtToken(app);
        testData = new TestDataBuilder(app);
        const dataSource = app.get<DataSource>(DataSource);

        const department = await testData.getDepartment();
        if (department) {
            testDepartmentId = department.id;
        } else {
            const newDepartment = dataSource.manager.create(Department, {
                id: randomUUID(),
                departmentName: '테스트 부서',
                departmentCode: `TEST-${Date.now()}`,
                type: DepartmentType.DEPARTMENT,
                order: 0,
            });
            const savedDepartment = await dataSource.manager.save(Department, newDepartment);
            testDepartmentId = savedDepartment.id;
        }
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    describe('GET /organization-management/departments', () => {
        it('부서 목록 조회 성공', () => {
            return request(app.getHttpServer())
                .get('/organization-management/departments')
                .query({
                    year: '2025',
                    month: '11',
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('hierarchy');
                    expect(res.body).toHaveProperty('flatList');
                    expect(Array.isArray(res.body.hierarchy)).toBe(true);
                    expect(Array.isArray(res.body.flatList)).toBe(true);
                });
        });

        it('연도와 월 누락 시 400 에러', () => {
            return request(app.getHttpServer())
                .get('/organization-management/departments')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });

        it('인증 토큰 없이 요청 시 테스트 환경 200 응답', () => {
            return request(app.getHttpServer())
                .get('/organization-management/departments')
                .query({
                    year: '2025',
                    month: '11',
                })
                .expect(200);
        });
    });
});
