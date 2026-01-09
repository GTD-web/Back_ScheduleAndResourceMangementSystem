import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleInfoUsecase } from '@resource/modules/resource/vehicle/application/usecases/vehicle-info.usecase';
import { VehicleInfoService } from '@resource/modules/resource/vehicle/application/services/vehicle-info.service';
import { ConsumableService } from '@resource/modules/resource/vehicle/application/services/consumable.service';
import { NotificationUsecase } from '@resource/modules/notification/application/usecases/notification.usecase';
import { NotificationService } from '@resource/modules/notification/application/services/notification.service';
import { AdapterService } from '@resource/modules/notification/application/services/adapter.service';
import { EmployeeNotificationService } from '@resource/modules/notification/application/services/employee-notification.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { UserService } from '@resource/modules/auth/application/services/user.service';
import {
    Resource,
    ResourceGroup,
    VehicleInfo,
    Consumable,
    Notification,
    EmployeeNotification,
    ResourceManager,
    Entities,
    Employee,
} from '@libs/entities';
import { getTestDbConfig, closeTestContainer } from '../../test-db.config';
import { VehicleInfoRepository } from '@resource/modules/resource/vehicle/infrastructure/adapters/out/persistence/vehicle-info.repository';
import { ConsumableRepository } from '@resource/modules/resource/vehicle/infrastructure/adapters/out/persistence/consumable.repository';
import { NotificationRepository } from '@resource/modules/notification/infrastructure/adapters/out/persistence/notification.repository';
import { EmployeeNotificationRepository } from '@resource/modules/notification/infrastructure/adapters/out/persistence/employee-notification.repository';
import { ResourceType } from '@libs/enums/resource-type.enum';
import { DataSource } from 'typeorm';
import { ResourceService } from '@resource/modules/resource/common/application/services/resource.service';
import { ResourceRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource.repository';
import { ResourceGroupService } from '@resource/modules/resource/common/application/services/resource-group.service';
import { ResourceGroupRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource-group.repository';
import { NotFoundException } from '@nestjs/common';
import { UpdateVehicleInfoDto } from '@resource/modules/resource/vehicle/application/dtos/update-vehicle-info.dto';

jest.setTimeout(30000);

describe('VehicleInfoUsecase Integration Test', () => {
    let moduleRef: TestingModule;
    let vehicleInfoUsecase: VehicleInfoUsecase;
    let vehicleInfoService: VehicleInfoService;
    let resourceService: ResourceService;
    let resourceGroupService: ResourceGroupService;
    let dataSource: DataSource;
    const TEST_ID = 'vehicle-info-usecase-test';
    let EMPLOYEE_ID: string;

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
                TypeOrmModule.forFeature(Entities),
            ],
            providers: [
                VehicleInfoUsecase,
                VehicleInfoService,
                ResourceService,
                ResourceGroupService,
                ConsumableService,
                NotificationUsecase,
                NotificationService,
                AdapterService,
                EmployeeNotificationService,
                {
                    provide: 'VehicleInfoRepositoryPort',
                    useClass: VehicleInfoRepository,
                },
                {
                    provide: 'ConsumableRepositoryPort',
                    useClass: ConsumableRepository,
                },
                {
                    provide: 'ResourceRepositoryPort',
                    useClass: ResourceRepository,
                },
                {
                    provide: 'ResourceGroupRepositoryPort',
                    useClass: ResourceGroupRepository,
                },
                {
                    provide: 'NotificationRepositoryPort',
                    useClass: NotificationRepository,
                },
                {
                    provide: 'EmployeeNotificationRepositoryPort',
                    useClass: EmployeeNotificationRepository,
                },
                {
                    provide: 'PushNotificationServicePort',
                    useValue: {
                        sendNotification: jest.fn().mockResolvedValue({
                            success: true,
                            message: 'success',
                            error: null,
                        }),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue({
                            userId: 'test-user-id',
                            name: 'Test User',
                            email: 'test@example.com',
                        }),
                        findByEmployeeId: jest.fn().mockResolvedValue({
                            userId: 'test-user-id',
                            name: 'Test User',
                            email: 'test@example.com',
                            fcmToken: 'test-fcm-token',
                        }),
                    },
                },
                {
                    provide: SchedulerRegistry,
                    useValue: {
                        addCronJob: jest.fn(),
                        deleteCronJob: jest.fn(),
                    },
                },
            ],
        }).compile();

        vehicleInfoUsecase = moduleRef.get<VehicleInfoUsecase>(VehicleInfoUsecase);
        vehicleInfoService = moduleRef.get<VehicleInfoService>(VehicleInfoService);
        resourceService = moduleRef.get<ResourceService>(ResourceService);
        resourceGroupService = moduleRef.get<ResourceGroupService>(ResourceGroupService);
        dataSource = moduleRef.get<DataSource>(DataSource);
    });

    afterAll(async () => {
        await moduleRef.close();
        await closeTestContainer(TEST_ID);
    });

    beforeEach(async () => {
        await dataSource.query('DELETE FROM employee_notifications');
        await dataSource.query('DELETE FROM notifications');
        await dataSource.query('DELETE FROM maintenances');
        await dataSource.query('DELETE FROM consumables');
        await dataSource.query('DELETE FROM vehicle_infos');
        await dataSource.query('DELETE FROM resource_managers');
        await dataSource.query('DELETE FROM resources');
        await dataSource.query('DELETE FROM resource_groups');
    });

    describe('findVehicleInfo', () => {
        it('should find vehicle info', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '차량',
                type: ResourceType.VEHICLE,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '스타렉스',
                description: '스타렉스입니다.',
                type: ResourceType.VEHICLE,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 차량 정보 생성
            const vehicleInfo = await vehicleInfoService.save({
                resourceId: resource.resourceId,
                totalMileage: '1000',
                leftMileage: '100',
                insuranceName: '현대해상',
                insuranceNumber: '123-456-789',
            } as VehicleInfo);

            // 4. 차량 정보 조회
            const result = await vehicleInfoUsecase.findVehicleInfo(vehicleInfo.vehicleInfoId);

            expect(result).toBeDefined();
            expect(result.totalMileage).toBe(1000);
            expect(result.leftMileage).toBe(100);
            expect(result.insuranceName).toBe('현대해상');
            expect(result.insuranceNumber).toBe('123-456-789');
        });

        it('should throw NotFoundException when vehicle info not found', async () => {
            await expect(vehicleInfoUsecase.findVehicleInfo('00000000-0000-0000-0000-000000000000')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('updateVehicleInfo', () => {
        it('should update vehicle info and notify when consumable needs replacement', async () => {
            // 1. Create an employee first
            const employee = await dataSource.getRepository(Employee).save({
                name: 'Test Employee',
                email: 'test@example.com',
                employeeNumber: '1234567890',
                department: 'Test Department',
                position: 'Test Position',
            });

            // 2. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '차량',
                type: ResourceType.VEHICLE,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 3. 자원 생성
            const resource = await resourceService.save({
                name: '스타렉스',
                description: '스타렉스입니다.',
                type: ResourceType.VEHICLE,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 4. 차량 정보 생성
            const vehicleInfo = await vehicleInfoService.save({
                resourceId: resource.resourceId,
                totalMileage: '1000',
                leftMileage: '100',
                insuranceName: '현대해상',
                insuranceNumber: '123-456-789',
            } as VehicleInfo);

            // 5. 소모품 생성
            await dataSource.getRepository(Consumable).save({
                vehicleId: vehicleInfo.vehicleInfoId,
                name: '엔진오일',
                replaceCycle: '5000',
                notifyReplacementCycle: true,
            });

            // 6. 자원 관리자 생성
            await dataSource.getRepository(ResourceManager).save({
                resourceId: resource.resourceId,
                employeeId: employee.employeeId,
            });

            // 7. 차량 정보 업데이트 (소모품 교체 주기 초과)
            const updateDto: UpdateVehicleInfoDto = {
                totalMileage: '6000',
                leftMileage: '50',
            };

            const result = await vehicleInfoUsecase.updateVehicleInfo(vehicleInfo.vehicleInfoId, updateDto);

            expect(result).toBeDefined();
            expect(result.totalMileage).toBe(6000);
            expect(result.leftMileage).toBe(50);
        });

        it('should throw NotFoundException when vehicle info not found', async () => {
            const updateDto: UpdateVehicleInfoDto = {
                totalMileage: '2000',
                leftMileage: '50',
            };

            await expect(
                vehicleInfoUsecase.updateVehicleInfo('00000000-0000-0000-0000-000000000000', updateDto),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
