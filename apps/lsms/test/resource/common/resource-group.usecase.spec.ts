import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceGroupUsecase } from '@resource/modules/resource/common/application/usecases/resource-group.usecase';
import { ResourceGroupService } from '@resource/modules/resource/common/application/services/resource-group.service';
import { ResourceGroup, Resource } from '@libs/entities';
import { getTestDbConfig, closeTestContainer, clearTestData } from '../../test-db.config';
import { ResourceGroupRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource-group.repository';
import { ResourceType } from '@libs/enums/resource-type.enum';
import { ResourceService } from '@resource/modules/resource/common/application/services/resource.service';
import { DataSource, Not, IsNull } from 'typeorm';
import { ResourceRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource.repository';
import { ResourceGroupWithResourcesResponseDto } from '@resource/modules/resource/common/application/dtos/resource-response.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.setTimeout(30000);

describe('ResourceGroupUsecase Integration Test', () => {
    let moduleRef: TestingModule;
    let resourceGroupUsecase: ResourceGroupUsecase;
    let resourceGroupService: ResourceGroupService;
    let resourceService: ResourceService;
    let dataSource: DataSource;
    const TEST_ID = 'resource-group-usecase-test';

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
                TypeOrmModule.forFeature([ResourceGroup, Resource]),
            ],
            providers: [
                ResourceGroupUsecase,
                ResourceGroupService,
                ResourceService,
                {
                    provide: 'ResourceGroupRepositoryPort',
                    useClass: ResourceGroupRepository,
                },
                {
                    provide: 'ResourceRepositoryPort',
                    useClass: ResourceRepository,
                },
            ],
        }).compile();

        resourceGroupUsecase = moduleRef.get<ResourceGroupUsecase>(ResourceGroupUsecase);
        resourceGroupService = moduleRef.get<ResourceGroupService>(ResourceGroupService);
        resourceService = moduleRef.get<ResourceService>(ResourceService);
        dataSource = moduleRef.get<DataSource>(DataSource);
    });

    afterAll(async () => {
        await moduleRef.close();
        await closeTestContainer(TEST_ID);
    });

    beforeEach(async () => {
        await clearTestData(TEST_ID);
    });

    describe('createResourceGroup', () => {
        it('should create a parent resource group', async () => {
            const createDto = {
                title: '테스트 자원 그룹',
                description: '테스트를 위한 자원 그룹입니다.',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
            };

            const result = await resourceGroupUsecase.createResourceGroup(createDto);

            expect(result).toBeDefined();
            expect(result.title).toBe(createDto.title);
            expect(result.description).toBe(createDto.description);
            expect(result.type).toBe(createDto.type);
            expect(result.resourceGroupId).toBeDefined();
            expect(result.order).toBe(0);
        });

        it('should create a child resource group', async () => {
            const parentGroup = await resourceGroupUsecase.createResourceGroup({
                title: '부모 그룹',
                description: '부모 그룹입니다.',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
            });

            const createDto = {
                title: '자식 그룹',
                description: '자식 그룹입니다.',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: parentGroup.resourceGroupId,
            };

            const result = await resourceGroupUsecase.createResourceGroup(createDto);

            expect(result).toBeDefined();
            expect(result.title).toBe(createDto.title);
            expect(result.parentResourceGroupId).toBe(parentGroup.resourceGroupId);
            expect(result.order).toBe(0);
        });
    });

    describe('findParentResourceGroups', () => {
        it('should find parent resource groups', async () => {
            // 부모 그룹 생성
            await resourceGroupUsecase.createResourceGroup({
                title: '부모 그룹 1',
                description: '부모 그룹 1입니다.',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
            });

            await resourceGroupUsecase.createResourceGroup({
                title: '부모 그룹 2',
                description: '부모 그룹 2입니다.',
                type: ResourceType.VEHICLE,
                parentResourceGroupId: null,
            });

            const groups = await resourceGroupUsecase.findParentResourceGroups();

            expect(groups).toBeDefined();
            expect(Array.isArray(groups)).toBe(true);
            expect(groups.length).toBe(2);
            groups.forEach((group) => {
                expect(group.parentResourceGroupId).toBeNull();
            });
        });
    });

    describe('findResourceGroupsWithResourceData', () => {
        it('should find resource groups with resource data by type', async () => {
            const parentGroup = await resourceGroupUsecase.createResourceGroup({
                title: '회의실 그룹',
                description: '회의실 그룹입니다.',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
            });

            const childGroup = await resourceGroupUsecase.createResourceGroup({
                title: '2층 회의실',
                description: '2층 회의실 그룹입니다.',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: parentGroup.resourceGroupId,
            });

            await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: childGroup.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            const groups = await resourceGroupUsecase.findResourceGroupsWithResourceData(ResourceType.MEETING_ROOM);

            expect(groups).toBeDefined();
            expect(groups.length).toBe(1);
            expect(groups[0].children.length).toBe(1);
            expect(groups[0].children[0].resources.length).toBe(1);
            expect(groups[0].children[0].resources[0].name).toBe('회의실 A');
        });
    });

    describe('updateResourceGroup', () => {
        it('should update a resource group', async () => {
            const group = await resourceGroupUsecase.createResourceGroup({
                title: '원래 제목',
                description: '원래 설명',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
            });

            const updateDto = {
                title: '수정된 제목',
                description: '수정된 설명',
            };

            const result = await resourceGroupUsecase.updateResourceGroup(group.resourceGroupId, updateDto);

            expect(result.title).toBe(updateDto.title);
            expect(result.description).toBe(updateDto.description);
        });
    });

    describe('reorderResourceGroups', () => {
        it('should reorder resource groups', async () => {
            const group1 = await resourceGroupUsecase.createResourceGroup({
                title: '그룹 1',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
            });

            const group2 = await resourceGroupUsecase.createResourceGroup({
                title: '그룹 2',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
            });

            await resourceGroupUsecase.reorderResourceGroups({
                orders: [
                    { resourceGroupId: group1.resourceGroupId, newOrder: 1 },
                    { resourceGroupId: group2.resourceGroupId, newOrder: 0 },
                ],
            });

            const groups = await resourceGroupService.findAll({
                where: { parentResourceGroupId: IsNull() },
                order: { order: 'ASC' },
            });

            expect(groups[0].resourceGroupId).toBe(group2.resourceGroupId);
            expect(groups[1].resourceGroupId).toBe(group1.resourceGroupId);
        });
    });

    describe('deleteResourceGroup', () => {
        it('should delete an empty resource group', async () => {
            const group = await resourceGroupUsecase.createResourceGroup({
                title: '삭제될 그룹',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
            });

            await resourceGroupUsecase.deleteResourceGroup(group.resourceGroupId);

            const deletedGroup = await resourceGroupService.findOne({
                where: { resourceGroupId: group.resourceGroupId },
            });

            expect(deletedGroup).toBeNull();
        });

        it('should throw BadRequestException when trying to delete group with resources', async () => {
            const group = await resourceGroupUsecase.createResourceGroup({
                title: '삭제될 그룹',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
            });

            await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            await expect(resourceGroupUsecase.deleteResourceGroup(group.resourceGroupId)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw NotFoundException when trying to delete non-existent group', async () => {
            await expect(
                resourceGroupUsecase.deleteResourceGroup('00000000-0000-0000-0000-000000000000'),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
