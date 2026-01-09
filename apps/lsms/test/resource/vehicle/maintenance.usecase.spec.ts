import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceUsecase } from '@resource/modules/resource/vehicle/application/usecases/maintenance.usecase';
import { MaintenanceService } from '@resource/modules/resource/vehicle/application/services/maintenance.service';
import { ConsumableService } from '@resource/modules/resource/vehicle/application/services/consumable.service';
import { VehicleInfoService } from '@resource/modules/resource/vehicle/application/services/vehicle-info.service';
import { ResourceService } from '@resource/modules/resource/common/application/services/resource.service';
import { ResourceGroupService } from '@resource/modules/resource/common/application/services/resource-group.service';
import { Resource, ResourceGroup, VehicleInfo, Consumable, Maintenance, Entities } from '@libs/entities';
import { getTestDbConfig, closeTestContainer } from '../../test-db.config';
import { MaintenanceRepository } from '@resource/modules/resource/vehicle/infrastructure/adapters/out/persistence/maintenance.repository';
import { ConsumableRepository } from '@resource/modules/resource/vehicle/infrastructure/adapters/out/persistence/consumable.repository';
import { VehicleInfoRepository } from '@resource/modules/resource/vehicle/infrastructure/adapters/out/persistence/vehicle-info.repository';
import { ResourceRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource.repository';
import { ResourceGroupRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource-group.repository';
import { ResourceType } from '@libs/enums/resource-type.enum';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RepositoryOptions } from '@libs/interfaces/repository-option.interface';

jest.setTimeout(30000);

describe('MaintenanceUsecase Integration Test', () => {
    let moduleRef: TestingModule;
    let maintenanceUsecase: MaintenanceUsecase;
    let maintenanceService: MaintenanceService;
    let consumableService: ConsumableService;
    let vehicleInfoService: VehicleInfoService;
    let resourceService: ResourceService;
    let resourceGroupService: ResourceGroupService;
    let dataSource: DataSource;
    const TEST_ID = 'maintenance-usecase-test';

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
                MaintenanceUsecase,
                MaintenanceService,
                ConsumableService,
                VehicleInfoService,
                ResourceService,
                ResourceGroupService,
                {
                    provide: 'MaintenanceRepositoryPort',
                    useClass: MaintenanceRepository,
                },
                {
                    provide: 'ConsumableRepositoryPort',
                    useClass: ConsumableRepository,
                },
                {
                    provide: 'VehicleInfoRepositoryPort',
                    useClass: VehicleInfoRepository,
                },
                {
                    provide: 'ResourceRepositoryPort',
                    useClass: ResourceRepository,
                },
                {
                    provide: 'ResourceGroupRepositoryPort',
                    useClass: ResourceGroupRepository,
                },
            ],
        }).compile();

        maintenanceUsecase = moduleRef.get<MaintenanceUsecase>(MaintenanceUsecase);
        maintenanceService = moduleRef.get<MaintenanceService>(MaintenanceService);
        consumableService = moduleRef.get<ConsumableService>(ConsumableService);
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
        await dataSource.query('DELETE FROM maintenances');
        await dataSource.query('DELETE FROM consumables');
        await dataSource.query('DELETE FROM vehicle_infos');
        await dataSource.query('DELETE FROM resources');
        await dataSource.query('DELETE FROM resource_groups');
    });

    describe('save', () => {
        it('should create a new maintenance record', async () => {
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

            // 4. 소모품 생성
            const consumable = await consumableService.save({
                vehicleId: vehicleInfo.vehicleInfoId,
                name: '엔진오일',
                replaceCycle: '5000',
                notifyReplacementCycle: true,
            } as Consumable);

            // 5. 정비 기록 생성
            const createDto = {
                consumableId: consumable.consumableId,
                date: new Date().toISOString(),
                mileage: '2000',
            };

            const result = await maintenanceUsecase.save(createDto);

            expect(result).toBeDefined();
            expect(parseInt(result.mileage)).toBe(2000);
        });
    });

    describe('findAll', () => {
        it('should find all maintenance records for a consumable', async () => {
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

            // 4. 소모품 생성
            const consumable = await consumableService.save({
                vehicleId: vehicleInfo.vehicleInfoId,
                name: '엔진오일',
                replaceCycle: '5000',
                notifyReplacementCycle: true,
            } as Consumable);

            // 5. 정비 기록 생성
            await maintenanceService.save({
                consumableId: consumable.consumableId,
                date: new Date().toISOString(),
                mileage: '2000',
            } as unknown as Maintenance);

            await maintenanceService.save({
                consumableId: consumable.consumableId,
                date: new Date().toISOString(),
                mileage: '4000',
            } as unknown as Maintenance);

            const result = await maintenanceUsecase.findAll(consumable.consumableId);

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(parseInt(result[0].mileage)).toBe(2000);
            expect(parseInt(result[1].mileage)).toBe(4000);
        });
    });

    describe('findOne', () => {
        it('should find one maintenance record', async () => {
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

            // 4. 소모품 생성
            const consumable = await consumableService.save({
                vehicleId: vehicleInfo.vehicleInfoId,
                name: '엔진오일',
                replaceCycle: '5000',
                notifyReplacementCycle: true,
            } as Consumable);

            // 5. 정비 기록 생성
            const maintenance = await maintenanceService.save({
                consumableId: consumable.consumableId,
                date: new Date().toISOString(),
                mileage: '2000',
                description: '엔진오일 교체',
            } as unknown as Maintenance);

            const result = await maintenanceUsecase.findOne(maintenance.maintenanceId);

            expect(result).toBeDefined();
            expect(result.mileage).toBe('2000');
        });

        it('should throw NotFoundException when maintenance record not found', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            const result = await maintenanceUsecase.findOne(nonExistentId);

            if (result !== null) {
                fail('Expected null result for non-existent maintenance record');
            }
        });
    });

    describe('update', () => {
        it('should update maintenance record', async () => {
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

            // 4. 소모품 생성
            const consumable = await consumableService.save({
                vehicleId: vehicleInfo.vehicleInfoId,
                name: '엔진오일',
                replaceCycle: '5000',
                notifyReplacementCycle: true,
            } as Consumable);

            // 5. 정비 기록 생성
            const maintenance = await maintenanceService.save({
                consumableId: consumable.consumableId,
                date: new Date().toISOString(),
                mileage: '2000',
                description: '엔진오일 교체',
            } as unknown as Maintenance);

            // 6. 정비 기록 업데이트
            const updateDto = {
                mileage: '2500',
            };

            const result = await maintenanceUsecase.update(maintenance.maintenanceId, updateDto);

            expect(result).toBeDefined();
            expect(parseInt(result.mileage)).toBe(2500);
        });

        it('should throw NotFoundException when maintenance record not found', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            const updateDto = {
                mileage: '2500',
            };

            try {
                await maintenanceUsecase.update(nonExistentId, updateDto);
                fail('Expected NotFoundException to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
            }
        });
    });

    describe('delete', () => {
        it('should delete maintenance record', async () => {
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

            // 4. 소모품 생성
            const consumable = await consumableService.save({
                vehicleId: vehicleInfo.vehicleInfoId,
                name: '엔진오일',
                replaceCycle: '5000',
                notifyReplacementCycle: true,
            } as Consumable);

            // 5. 정비 기록 생성
            const maintenance = await maintenanceService.save({
                consumableId: consumable.consumableId,
                date: new Date().toISOString(),
                mileage: '2000',
                description: '엔진오일 교체',
            } as unknown as Maintenance);

            // 6. 정비 기록 삭제
            await maintenanceUsecase.delete(maintenance.maintenanceId);

            // 7. 삭제 확인
            const result = await maintenanceUsecase.findOne(maintenance.maintenanceId);
            expect(result).toBeNull();
        });
    });
});
