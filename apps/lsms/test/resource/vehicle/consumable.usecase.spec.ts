import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsumableUsecase } from '@resource/modules/resource/vehicle/application/usecases/consumable.usecase';
import { ConsumableService } from '@resource/modules/resource/vehicle/application/services/consumable.service';
import { VehicleInfoService } from '@resource/modules/resource/vehicle/application/services/vehicle-info.service';
import { ResourceService } from '@resource/modules/resource/common/application/services/resource.service';
import { ResourceGroupService } from '@resource/modules/resource/common/application/services/resource-group.service';
import { Resource, ResourceGroup, VehicleInfo, Consumable, Entities } from '@libs/entities';
import { getTestDbConfig, closeTestContainer } from '../../test-db.config';
import { ConsumableRepository } from '@resource/modules/resource/vehicle/infrastructure/adapters/out/persistence/consumable.repository';
import { VehicleInfoRepository } from '@resource/modules/resource/vehicle/infrastructure/adapters/out/persistence/vehicle-info.repository';
import { ResourceRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource.repository';
import { ResourceGroupRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource-group.repository';
import { ResourceType } from '@libs/enums/resource-type.enum';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateConsumableDto } from '@resource/modules/resource/vehicle/application/dtos/create-vehicle-info.dto';

jest.setTimeout(30000);

describe('ConsumableUsecase Integration Test', () => {
    let moduleRef: TestingModule;
    let consumableUsecase: ConsumableUsecase;
    let consumableService: ConsumableService;
    let vehicleInfoService: VehicleInfoService;
    let resourceService: ResourceService;
    let resourceGroupService: ResourceGroupService;
    let dataSource: DataSource;
    const TEST_ID = 'consumable-usecase-test';

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
                ConsumableUsecase,
                ConsumableService,
                VehicleInfoService,
                ResourceService,
                ResourceGroupService,
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

        consumableUsecase = moduleRef.get<ConsumableUsecase>(ConsumableUsecase);
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
        await dataSource.query('DELETE FROM consumables');
        await dataSource.query('DELETE FROM vehicle_infos');
        await dataSource.query('DELETE FROM resources');
        await dataSource.query('DELETE FROM resource_groups');
    });

    describe('save', () => {
        it('should create a new consumable', async () => {
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
            const createDto: CreateConsumableDto = {
                vehicleId: vehicleInfo.vehicleInfoId,
                name: '엔진오일',
                replaceCycle: '5000',
                notifyReplacementCycle: true,
            };

            const result = await consumableUsecase.save(createDto);

            expect(result).toBeDefined();
            expect(result.name).toBe('엔진오일');
            expect(parseInt(result.replaceCycle)).toBe(5000);
            expect(result.notifyReplacementCycle).toBe(true);
        });
    });

    describe('findAll', () => {
        it('should find all consumables', async () => {
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
            await consumableService.save({
                vehicleId: vehicleInfo.vehicleInfoId,
                name: '엔진오일',
                replaceCycle: '5000',
                notifyReplacementCycle: true,
            } as Consumable);

            await consumableService.save({
                vehicleId: vehicleInfo.vehicleInfoId,
                name: '타이어',
                replaceCycle: '10000',
                notifyReplacementCycle: true,
            } as Consumable);

            const result = await consumableUsecase.findAll();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('엔진오일');
            expect(result[1].name).toBe('타이어');
        });
    });

    describe('findOne', () => {
        it('should find one consumable', async () => {
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
            } as unknown as Consumable);

            const result = await consumableUsecase.findOne({
                where: {
                    consumableId: consumable.consumableId,
                },
            });

            expect(result).toBeDefined();
            expect(result.name).toBe('엔진오일');
            expect(parseInt(result.replaceCycle)).toBe(5000);
            expect(result.notifyReplacementCycle).toBe(true);
        });

        it('should return null when consumable not found', async () => {
            const result = await consumableUsecase.findOne({
                where: {
                    consumableId: '00000000-0000-0000-0000-000000000000',
                },
            });
            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update consumable', async () => {
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

            // 5. 소모품 업데이트
            const updateData = {
                name: '새 엔진오일',
                replaceCycle: '7000',
                notifyReplacementCycle: false,
            };

            const result = await consumableUsecase.update(consumable.consumableId, updateData);

            expect(result).toBeDefined();
            expect(result.name).toBe('새 엔진오일');
            expect(parseInt(result.replaceCycle)).toBe(7000);
            expect(result.notifyReplacementCycle).toBe(false);
        });

        it('should throw NotFoundException when consumable not found', async () => {
            const updateData = {
                name: '새 엔진오일',
                replaceCycle: '7000',
            };

            await expect(consumableUsecase.update('00000000-0000-0000-0000-000000000000', updateData)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('delete', () => {
        it('should delete consumable', async () => {
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

            // 5. 소모품 삭제
            await consumableUsecase.delete(consumable.consumableId);

            // 6. 삭제 확인
            const result = await consumableUsecase.findOne({
                where: {
                    consumableId: consumable.consumableId,
                },
            });
            expect(result).toBeNull();
        });

        it('should handle non-existent consumable deletion gracefully', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            await consumableUsecase.delete(nonExistentId);

            const result = await consumableUsecase.findOne({
                where: {
                    consumableId: nonExistentId,
                },
            });
            expect(result).toBeNull();
        });
    });
});
