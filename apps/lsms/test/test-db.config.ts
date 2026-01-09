import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Entities } from '../libs/entities';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';

import * as bcrypt from 'bcryptjs';

const containers = new Map<string, StartedPostgreSqlContainer>();
const dataSources = new Map<string, DataSource>();

// PostgreSQL의 기본 포트
const POSTGRESQL_DEFAULT_PORT = 5432;

export async function getTestDbConfig(testId: string): Promise<TypeOrmModuleOptions> {
    if (!containers.has(testId)) {
        // 컨테이너 생성 - 내부 포트는 PostgreSQL 기본 포트 사용
        const container = await new PostgreSqlContainer()
            .withExposedPorts(POSTGRESQL_DEFAULT_PORT)
            .withStartupTimeout(60000) // 60초 타임아웃
            .withCommand(['postgres', '-c', 'fsync=off']) // 성능 최적화
            .start();

        containers.set(testId, container);

        // Create and initialize DataSource for seeding
        const dataSource = new DataSource({
            type: 'postgres',
            host: container.getHost(),
            port: container.getMappedPort(POSTGRESQL_DEFAULT_PORT),
            username: container.getUsername(),
            password: container.getPassword(),
            database: container.getDatabase(),
            entities: Entities,
            synchronize: true,
        });

        await dataSource.initialize();
        dataSources.set(testId, dataSource);

        // Seed initial data
        // await seedTestData(dataSource);
    }

    const container = containers.get(testId);

    return {
        type: 'postgres',
        host: container.getHost(),
        port: container.getMappedPort(POSTGRESQL_DEFAULT_PORT),
        username: container.getUsername(),
        password: container.getPassword(),
        database: container.getDatabase(),
        entities: Entities,
        synchronize: true,
    };
}

// async function seedTestData(dataSource: DataSource) {
//     // Clear existing data
//     await dataSource.synchronize(true);

//     // Create repositories
//     const employeeRepo = dataSource.getRepository(Employee);
//     const resourceGroupRepo = dataSource.getRepository(ResourceGroup);
//     const userRepo = dataSource.getRepository(User);

//     // Seed employees and users
//     for (const employeeData of employeesSeedData) {
//         // Create employee first
//         const savedEmployee = await employeeRepo.save(employeeData);

//         // Create associated user
//         const hashedPassword = await bcrypt.hash(employeeData.password, 10);
//         const user = await userRepo.save({
//             email: employeeData.email,
//             password: hashedPassword,
//             employeeId: savedEmployee.employeeId,
//             roles: employeeData.roles,
//         });

//         // Update employee with userId
//         savedEmployee.userId = user.userId;
//         await employeeRepo.save(savedEmployee);
//     }

//     // 1. 상위 자원 그룹 생성
//     const parentGroups = await resourceGroupRepo.save(
//         resourceGroupsSeedData.map((group) => ({
//             ...group,
//             parentResourceGroupId: null,
//         })),
//     );

//     // 2. 하위 자원 그룹 생성
//     const subGroups = [];
//     for (const parentGroup of parentGroups) {
//         if (parentGroup.type === ResourceType.VEHICLE) {
//             const subGroup = await resourceGroupRepo.save({
//                 ...subResourceGroupsSeedData[0],
//                 parentResourceGroupId: parentGroup.resourceGroupId,
//             });
//             subGroups.push(subGroup);
//         }
//     }

//     // 3. 자원 생성
//     const resourceRepo = dataSource.getRepository(Resource);

//     // 하위 그룹에 속한 자원 생성 (하위 그룹이 있는 경우)
//     if (subGroups.length > 0) {
//         const subGroupResources = await Promise.all(
//             resourcesSeedData.map((resource) =>
//                 resourceRepo.save({
//                     name: resource.title,
//                     description: resource.description,
//                     type: resource.type,
//                     resourceGroupId: subGroups[0].resourceGroupId,
//                     notifyParticipantChange: true,
//                     notifyReservationChange: true,
//                     images: [],
//                 }),
//             ),
//         );
//     }
// }

export async function clearTestData(testId: string) {
    const dataSource = dataSources.get(testId);
    if (dataSource && dataSource.isInitialized) {
        await dataSource.synchronize(true);
    }
}

export async function closeTestContainer(testId: string) {
    const container = containers.get(testId);
    const dataSource = dataSources.get(testId);

    if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
        dataSources.delete(testId);
    }

    if (container) {
        await container.stop();
        containers.delete(testId);
    }
}

// 모든 컨테이너를 정리하는 유틸리티 함수
export async function closeAllContainers() {
    for (const [testId, dataSource] of dataSources.entries()) {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
    dataSources.clear();

    for (const [testId, container] of containers.entries()) {
        await container.stop();
        containers.delete(testId);
    }
}
