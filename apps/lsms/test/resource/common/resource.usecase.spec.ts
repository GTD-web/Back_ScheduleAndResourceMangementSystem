import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceUsecase } from '@resource/modules/resource/common/application/usecases/resource.usecase';
import { ResourceService } from '@resource/modules/resource/common/application/services/resource.service';
import { ResourceGroupService } from '@resource/modules/resource/common/application/services/resource-group.service';
import { ResourceManagerService } from '@resource/modules/resource/common/application/services/resource-manager.service';
import {
    Resource,
    ResourceGroup,
    ResourceManager,
    User,
    Employee,
    Reservation,
    ReservationParticipant,
    VehicleInfo,
    Consumable,
    Maintenance,
    Notification,
    EmployeeNotification,
    MeetingRoomInfo,
    AccommodationInfo,
    Entities,
} from '@libs/entities';
import { getTestDbConfig, closeTestContainer } from '../../test-db.config';
import { ResourceRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource.repository';
import { ResourceGroupRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource-group.repository';
import { ResourceManagerRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource-manager.repository';
import { ResourceType } from '@libs/enums/resource-type.enum';
import { DataSource, FindOneOptions } from 'typeorm';
import { UserService } from '@resource/modules/auth/application/services/user.service';
import { UserRepository } from '@resource/modules/auth/infrastructure/adapters/out/user.repository';
import { Role } from '@libs/enums/role-type.enum';
import { ReservationService } from '@resource/modules/reservation/application/services/reservation.service';
import { VehicleInfoService } from '@resource/modules/resource/vehicle/application/services/vehicle-info.service';
import { VehicleInfoUsecase } from '@resource/modules/resource/vehicle/application/usecases/vehicle-info.usecase';
import { MeetingRoomResourceHandler } from '@resource/modules/resource/meeting-room/application/handlers/meeting-room-resource.handler';
import { AccommodationResourceHandler } from '@resource/modules/resource/accommodation/application/handlers/accommodation-resource.handler';
import { VehicleResourceHandler } from '@resource/modules/resource/vehicle/application/handlers/vehicle-resource.handler';
import { ReservationRepository } from '@resource/modules/reservation/infrastructure/adapters/out/persistence/reservation.repository';
import { ReservationParticipantRepository } from '@resource/modules/reservation/infrastructure/adapters/out/persistence/reservation-participant.repository';
import { VehicleInfoRepository } from '@resource/modules/resource/vehicle/infrastructure/adapters/out/persistence/vehicle-info.repository';
import { ConsumableRepository } from '@resource/modules/resource/vehicle/infrastructure/adapters/out/persistence/consumable.repository';
import { MaintenanceRepository } from '@resource/modules/resource/vehicle/infrastructure/adapters/out/persistence/maintenance.repository';
import { ConsumableService } from '@resource/modules/resource/vehicle/application/services/consumable.service';
import { MaintenanceService } from '@resource/modules/resource/vehicle/application/services/maintenance.service';
import { NotificationService } from '@resource/modules/notification/application/services/notification.service';
import { NotificationUsecase } from '@resource/modules/notification/application/usecases/notification.usecase';
import { NotificationRepository } from '@resource/modules/notification/infrastructure/adapters/out/persistence/notification.repository';
import { EmployeeNotificationRepository } from '@resource/modules/notification/infrastructure/adapters/out/persistence/employee-notification.repository';
import { AdapterService } from '@resource/modules/notification/application/services/adapter.service';
import { EmployeeNotificationService } from '@resource/modules/notification/application/services/employee-notification.service';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { MeetingRoomInfoService } from '@resource/modules/resource/meeting-room/application/services/meeting-room-info.service';
import { MeetingRoomInfoRepository } from '@resource/modules/resource/meeting-room/infrastructure/adapters/out/persistence/meeting-room-info.repository';
import { AccommodationInfoService } from '@resource/modules/resource/accommodation/application/services/accommodation-info.service';
import { AccommodationInfoRepository } from '@resource/modules/resource/accommodation/infrastructure/adapters/out/persistence/accommodation-info.repository';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ReservationStatus, ParticipantsType } from '@libs/enums/reservation-type.enum';
import {
    ResourceResponseDto,
    ResourceWithReservationsResponseDto,
    ResourceGroupWithResourcesAndReservationsResponseDto,
    ChildResourceGroupResponseDto,
} from '@resource/modules/resource/common/application/dtos/resource-response.dto';
import { VehicleInfoResponseDto } from '@resource/modules/resource/vehicle/application/dtos/vehicle-response.dto';
import {
    ReturnVehicleDto,
    UpdateResourceOrdersDto,
} from '@resource/modules/resource/common/application/dtos/update-resource.dto';
import { ResourceLocation } from '@resource/modules/resource/common/application/dtos/create-resource.dto';
import { RepositoryOptions } from '@libs/interfaces/repository-option.interface';

jest.setTimeout(30000);

describe('ResourceUsecase Integration Test', () => {
    let moduleRef: TestingModule;
    let resourceUsecase: ResourceUsecase;
    let resourceService: ResourceService;
    let resourceGroupService: ResourceGroupService;
    let resourceManagerService: ResourceManagerService;
    let userService: UserService;
    let dataSource: DataSource;
    let vehicleInfoService: VehicleInfoService;
    let vehicleInfoUsecase: VehicleInfoUsecase;
    const TEST_ID = 'resource-usecase-test';

    // 테스트에 사용할 직원 ID (테스트 실행 시 DB에서 가져올 예정)
    let TEST_EMPLOYEE_ID: string;
    let TEST_USER: User;

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
                ScheduleModule.forRoot(),
            ],
            providers: [
                ResourceUsecase,
                ResourceService,
                ResourceGroupService,
                ResourceManagerService,
                UserService,
                ReservationService,
                VehicleInfoService,
                VehicleInfoUsecase,
                ConsumableService,
                MaintenanceService,
                NotificationService,
                NotificationUsecase,
                AdapterService,
                EmployeeNotificationService,
                SchedulerRegistry,
                ConfigService,
                VehicleResourceHandler,
                MeetingRoomResourceHandler,
                AccommodationResourceHandler,
                MeetingRoomInfoService,
                AccommodationInfoService,
                MeetingRoomInfoRepository,
                AccommodationInfoRepository,
                {
                    provide: 'MeetingRoomInfoRepositoryPort',
                    useClass: MeetingRoomInfoRepository,
                },
                {
                    provide: 'AccommodationInfoRepositoryPort',
                    useClass: AccommodationInfoRepository,
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
                    provide: 'ResourceManagerRepositoryPort',
                    useClass: ResourceManagerRepository,
                },
                {
                    provide: 'UserRepositoryPort',
                    useClass: UserRepository,
                },
                {
                    provide: 'ReservationRepositoryPort',
                    useClass: ReservationRepository,
                },
                {
                    provide: 'ReservationParticipantRepositoryPort',
                    useClass: ReservationParticipantRepository,
                },
                {
                    provide: 'VehicleInfoRepositoryPort',
                    useClass: VehicleInfoRepository,
                },
                {
                    provide: 'ConsumableRepositoryPort',
                    useClass: ConsumableRepository,
                },
                {
                    provide: 'MaintenanceRepositoryPort',
                    useClass: MaintenanceRepository,
                },
                {
                    provide: 'ResourceTypeHandlers',
                    useFactory: (
                        vehicleHandler: VehicleResourceHandler,
                        meetingRoomHandler: MeetingRoomResourceHandler,
                        accommodationHandler: AccommodationResourceHandler,
                    ) => {
                        const handlers = new Map();
                        handlers.set(ResourceType.VEHICLE, vehicleHandler);
                        handlers.set(ResourceType.MEETING_ROOM, meetingRoomHandler);
                        handlers.set(ResourceType.ACCOMMODATION, accommodationHandler);
                        return handlers;
                    },
                    inject: [VehicleResourceHandler, MeetingRoomResourceHandler, AccommodationResourceHandler],
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
            ],
        }).compile();

        resourceUsecase = moduleRef.get<ResourceUsecase>(ResourceUsecase);
        resourceService = moduleRef.get<ResourceService>(ResourceService);
        resourceGroupService = moduleRef.get<ResourceGroupService>(ResourceGroupService);
        resourceManagerService = moduleRef.get<ResourceManagerService>(ResourceManagerService);
        userService = moduleRef.get<UserService>(UserService);
        dataSource = moduleRef.get<DataSource>(DataSource);
        vehicleInfoService = moduleRef.get<VehicleInfoService>(VehicleInfoService);
        vehicleInfoUsecase = moduleRef.get<VehicleInfoUsecase>(VehicleInfoUsecase);

        // 테스트에 사용할 직원 ID 가져오기
        const employee = await dataSource.getRepository(Employee).findOne({
            where: {},
        });
        TEST_EMPLOYEE_ID = employee.employeeId;

        // 테스트에 사용할 사용자 가져오기
        TEST_USER = await dataSource.getRepository(User).findOne({
            where: { employeeId: TEST_EMPLOYEE_ID },
            relations: ['employee'],
        });
    });

    afterAll(async () => {
        await moduleRef.close();
        await closeTestContainer(TEST_ID);
    });

    beforeEach(async () => {
        await dataSource.query('DELETE FROM reservation_participants');
        await dataSource.query('DELETE FROM reservations');
        await dataSource.query('DELETE FROM resource_managers');
        await dataSource.query('DELETE FROM vehicle_infos');
        await dataSource.query('DELETE FROM resources');
        await dataSource.query('DELETE FROM resource_groups');
    });

    describe('findResourcesByTypeAndDateWithReservations', () => {
        it('should find resources with reservations', async () => {
            // 1. 자원 그룹 생성
            const parentGroup = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            const childGroup = await resourceGroupService.save({
                title: '2층 회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: parentGroup.resourceGroupId,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: childGroup.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 예약 생성
            const startDate = new Date();
            startDate.setHours(startDate.getHours() + 1);
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);

            const reservation = await dataSource.getRepository(Reservation).save({
                resourceId: resource.resourceId,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status: ReservationStatus.CONFIRMED,
            });

            await dataSource.getRepository(ReservationParticipant).save({
                reservationId: reservation.reservationId,
                employeeId: TEST_EMPLOYEE_ID,
                isHost: true,
                type: ParticipantsType.PARTICIPANT,
            });

            // 4. 자원 조회
            const result = (await resourceUsecase.findResourcesByTypeAndDateWithReservations(
                ResourceType.MEETING_ROOM,
                startDate.toISOString(),
                endDate.toISOString(),
                TEST_USER,
            )) as ResourceGroupWithResourcesAndReservationsResponseDto[];

            expect(result).toBeDefined();
            expect(result.length).toBe(1);
            expect(result[0].resources?.[0].reservations?.length).toBe(1);
            expect(result[0].resources?.[0].reservations?.[0].isMine).toBe(true);
        });

        it('should throw BadRequestException when start date is after end date', async () => {
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() - 1);

            await expect(
                resourceUsecase.findResourcesByTypeAndDateWithReservations(
                    ResourceType.MEETING_ROOM,
                    startDate.toISOString(),
                    endDate.toISOString(),
                    TEST_USER,
                ),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('findResourceDetail', () => {
        it('should find resource detail', async () => {
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
            await vehicleInfoService.save({
                resourceId: resource.resourceId,
                totalMileage: '1000',
                leftMileage: '100',
                insuranceName: '현대해상',
                insuranceNumber: '123-456-789',
            } as VehicleInfo);

            // 4. 자원 관리자 생성
            await resourceManagerService.save({
                resourceId: resource.resourceId,
                employeeId: TEST_EMPLOYEE_ID,
            } as ResourceManager);

            // 5. 자원 상세 조회
            const result = (await resourceUsecase.findResourceDetail(resource.resourceId)) as ResourceResponseDto;

            expect(result).toBeDefined();
            expect(result.name).toBe('스타렉스');
            expect((result.typeInfo as VehicleInfoResponseDto)?.insuranceName).toBe('현대해상');
            expect(result.managers?.length).toBe(1);
            expect(result.managers?.[0].employeeId).toBe(TEST_EMPLOYEE_ID);
        });

        it('should throw NotFoundException when resource not found', async () => {
            await expect(resourceUsecase.findResourceDetail('00000000-0000-0000-0000-000000000000')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('createResourceWithInfos', () => {
        it('should create a resource with managers', async () => {
            // 1. 차량 자원 그룹 찾기
            const group = await resourceGroupService.save({
                title: '차량',
                type: ResourceType.VEHICLE,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 차량 자원 생성 데이터 준비
            const createDto = {
                resource: {
                    resourceGroupId: group.resourceGroupId,
                    name: '스타렉스 (12도 3456)',
                    description: '스타렉스 차량',
                    type: ResourceType.VEHICLE,
                    notifyParticipantChange: true,
                    notifyReservationChange: true,
                    images: ['https://example.com/image.jpg'],
                },
                typeInfo: {
                    leftMileage: '100',
                    totalMileage: '10000',
                    insuranceName: '현대카드',
                    insuranceNumber: '1234567890',
                    parkingLocationImages: ['https://example.com/parking-location-image.jpg'],
                    odometerImages: ['https://example.com/odometer-image.jpg'],
                },
                managers: [
                    {
                        employeeId: TEST_EMPLOYEE_ID,
                    },
                ],
            };

            // 3. 자원 생성
            const result = await resourceUsecase.createResourceWithInfos(createDto);

            // 4. 검증
            expect(result).toBe(true);

            // 5. 생성된 자원 조회
            const resources = await resourceService.findAll({
                where: { resourceGroupId: group.resourceGroupId },
                relations: ['resourceManagers', 'resourceManagers.employee'],
            });

            expect(resources).toBeDefined();
            expect(resources.length).toBe(1);

            const resource = resources[0];
            expect(resource.name).toBe(createDto.resource.name);
            expect(resource.description).toBe(createDto.resource.description);
            expect(resource.type).toBe(createDto.resource.type);
            expect(resource.resourceManagers).toBeDefined();
            expect(resource.resourceManagers.length).toBe(1);
            expect(resource.resourceManagers[0].employeeId).toBe(TEST_EMPLOYEE_ID);
        });

        it('should throw BadRequestException when managers are not provided', async () => {
            const group = await resourceGroupService.save({
                title: '차량',
                type: ResourceType.VEHICLE,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            const createDto = {
                resource: {
                    resourceGroupId: group.resourceGroupId,
                    name: '스타렉스 (12도 3456)',
                    description: '스타렉스 차량',
                    type: ResourceType.VEHICLE,
                    notifyParticipantChange: true,
                    notifyReservationChange: true,
                },
                typeInfo: {
                    leftMileage: '100',
                    totalMileage: '10000',
                    insuranceName: '현대카드',
                    insuranceNumber: '1234567890',
                    parkingLocationImages: ['https://example.com/parking-location-image.jpg'],
                    odometerImages: ['https://example.com/odometer-image.jpg'],
                },
                managers: [],
            };

            await expect(resourceUsecase.createResourceWithInfos(createDto)).rejects.toThrow('Managers are required');
        });
    });

    describe('updateResource', () => {
        it('should update resource information', async () => {
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

            // 3. 자원 관리자 생성
            await resourceManagerService.save({
                resourceId: resource.resourceId,
                employeeId: TEST_EMPLOYEE_ID,
            } as ResourceManager);

            // 4. 자원 정보 업데이트
            const updateDto = {
                resource: {
                    name: '수정된 스타렉스',
                    description: '수정된 설명',
                },
                managers: [
                    {
                        employeeId: TEST_EMPLOYEE_ID,
                    },
                ],
            };

            const result = (await resourceUsecase.updateResource(
                resource.resourceId,
                updateDto,
            )) as ResourceResponseDto;

            expect(result).toBeDefined();
            expect(result.name).toBe(updateDto.resource.name);
            expect(result.description).toBe(updateDto.resource.description);
            expect(result.managers?.length).toBe(1);
            expect(result.managers?.[0].employeeId).toBe(TEST_EMPLOYEE_ID);
        });

        it('should throw NotFoundException when resource not found', async () => {
            await expect(
                resourceUsecase.updateResource('00000000-0000-0000-0000-000000000000', {
                    resource: {
                        name: '수정된 이름',
                    },
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('reorderResources', () => {
        it('should reorder resources', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '차량',
                type: ResourceType.VEHICLE,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원들 생성
            const resource1 = await resourceService.save({
                name: '스타렉스 1',
                type: ResourceType.VEHICLE,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            const resource2 = await resourceService.save({
                name: '스타렉스 2',
                type: ResourceType.VEHICLE,
                resourceGroupId: group.resourceGroupId,
                order: 1,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 순서 변경
            await resourceUsecase.reorderResources({
                orders: [
                    { resourceId: resource1.resourceId, newOrder: 1 },
                    { resourceId: resource2.resourceId, newOrder: 0 },
                ],
            });

            // 4. 변경된 순서 확인
            const resources = await resourceService.findAll({
                where: { resourceGroupId: group.resourceGroupId },
                order: { order: 'ASC' },
            });

            expect(resources[0].resourceId).toBe(resource2.resourceId);
            expect(resources[1].resourceId).toBe(resource1.resourceId);
        });
    });

    describe('deleteResource', () => {
        it('should soft delete a resource', async () => {
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
                type: ResourceType.VEHICLE,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 자원 삭제
            await resourceUsecase.deleteResource(resource.resourceId);

            // 4. 삭제 확인
            const deletedResource = await resourceService.findOne({
                where: { resourceId: resource.resourceId },
            } as RepositoryOptions);

            expect(deletedResource).toBeNull();
        });

        it('should throw NotFoundException when resource not found', async () => {
            await expect(resourceUsecase.deleteResource('00000000-0000-0000-0000-000000000000')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('returnVehicle', () => {
        it('should return a vehicle', async () => {
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

            // 4. 차량 반납 정보 업데이트
            const returnDto: ReturnVehicleDto = {
                location: {
                    address: '서울시 강남구',
                    detailAddress: '123번지',
                },
                leftMileage: '50',
                totalMileage: '1050',
                parkingLocationImages: ['https://example.com/new-parking-location.jpg'],
                odometerImages: ['https://example.com/new-odometer.jpg'],
            };

            await resourceUsecase.returnVehicle(resource.resourceId, returnDto);

            // 5. 업데이트 확인
            const updatedResource = await resourceService.findOne({
                where: { resourceId: resource.resourceId },
            });

            const updatedVehicleInfo = await vehicleInfoService.findOne({
                where: { resourceId: resource.resourceId },
            });

            expect(updatedResource).toBeDefined();
            expect(updatedResource.location).toEqual(returnDto.location);
            expect(updatedVehicleInfo.leftMileage).toBe(returnDto.leftMileage);
            expect(updatedVehicleInfo.totalMileage).toBe(returnDto.totalMileage);
            expect(updatedVehicleInfo.parkingLocationImages).toEqual(returnDto.parkingLocationImages);
            expect(updatedVehicleInfo.odometerImages).toEqual(returnDto.odometerImages);
        });

        it('should throw NotFoundException when resource not found', async () => {
            const returnDto: ReturnVehicleDto = {
                location: {
                    address: '서울시 강남구',
                    detailAddress: '123번지',
                },
                leftMileage: '50',
                totalMileage: '1050',
                parkingLocationImages: ['https://example.com/new-parking-location.jpg'],
                odometerImages: ['https://example.com/new-odometer.jpg'],
            };

            await expect(
                resourceUsecase.returnVehicle('00000000-0000-0000-0000-000000000000', returnDto),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
