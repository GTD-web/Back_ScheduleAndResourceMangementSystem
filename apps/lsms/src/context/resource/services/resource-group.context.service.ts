import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { ERROR_MESSAGE } from '../../../../libs/constants/error-message';
import { ResourceType } from '../../../../libs/enums/resource-type.enum';

// Domain Services
import { DomainResourceGroupService } from '../../../domain/resource-group/resource-group.service';
import { DomainResourceService } from '../../../domain/resource/resource.service';

// DTOs
import { CreateResourceGroupDto } from '../../../business/resource-management/dtos/resource/create-resource.dto';
import {
    ResourceGroupResponseDto,
    ResourceGroupWithResourcesResponseDto,
    ResourceSelectResponseDto,
} from '../../../business/resource-management/dtos/resource/resource-response.dto';
import {
    UpdateResourceGroupDto,
    UpdateResourceGroupOrdersDto,
} from '../../../business/resource-management/dtos/resource/update-resource.dto';

@Injectable()
export class ResourceGroupContextService {
    constructor(
        private readonly domainResourceGroupService: DomainResourceGroupService,
        private readonly domainResourceService: DomainResourceService,
        private readonly dataSource: DataSource,
    ) {}

    async 상위_자원그룹을_조회한다(): Promise<ResourceGroupResponseDto[]> {
        const resourceGroups = await this.domainResourceGroupService.findAll({
            where: {
                parentResourceGroupId: IsNull(),
            },
            order: {
                order: 'ASC',
            },
        });
        return resourceGroups;
    }

    async 자원데이터포함_그룹목록을_조회한다(type?: ResourceType): Promise<ResourceGroupWithResourcesResponseDto[]> {
        const whereCondition: any = {
            parentResourceGroupId: IsNull(),
        };

        if (type) {
            whereCondition.type = type;
        }

        const parentGroups = await this.domainResourceGroupService.findAll({
            where: whereCondition,
            order: { order: 'ASC' },
        });

        const result: ResourceGroupWithResourcesResponseDto[] = [];

        for (const parentGroup of parentGroups) {
            const childGroups = await this.domainResourceGroupService.findAll({
                where: { parentResourceGroupId: parentGroup.resourceGroupId },
                order: { order: 'ASC' },
            });

            const childGroupsWithResources = await Promise.all(
                childGroups.map(async (childGroup) => {
                    const resources = await this.domainResourceService.findAll({
                        where: { resourceGroupId: childGroup.resourceGroupId },
                        order: { order: 'ASC' },
                    });

                    const resourceSelectDtos: ResourceSelectResponseDto[] = resources.map((resource) => ({
                        resourceId: resource.resourceId,
                        name: resource.name,
                        images: resource.images,
                        isAvailable: resource.isAvailable,
                        unavailableReason: resource.unavailableReason,
                        resourceGroupId: resource.resourceGroupId,
                        order: resource.order,
                    }));

                    return {
                        ...childGroup,
                        resources: resourceSelectDtos,
                    };
                }),
            );

            result.push({
                ...parentGroup,
                children: childGroupsWithResources,
            });
        }

        return result;
    }

    async 자원그룹을_생성한다(createResourceGroupDto: CreateResourceGroupDto): Promise<ResourceGroupResponseDto> {
        const groups = await this.domainResourceGroupService.findAll({
            where: { parentResourceGroupId: createResourceGroupDto.parentResourceGroupId },
        });

        const order = groups.length;

        const savedGroup = await this.domainResourceGroupService.save({
            ...createResourceGroupDto,
            order,
        });

        return savedGroup;
    }

    async 자원그룹을_수정한다(
        resourceGroupId: string,
        updateResourceGroupDto: UpdateResourceGroupDto,
    ): Promise<ResourceGroupResponseDto> {
        const existingGroup = await this.domainResourceGroupService.findOne({
            where: { resourceGroupId },
        });

        if (!existingGroup) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.RESOURCE_GROUP.NOT_FOUND);
        }

        await this.domainResourceGroupService.update(resourceGroupId, updateResourceGroupDto);

        const updatedGroup = await this.domainResourceGroupService.findOne({
            where: { resourceGroupId },
        });

        return updatedGroup;
    }

    async 자원그룹_순서를_변경한다(updateResourceGroupOrdersDto: UpdateResourceGroupOrdersDto): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await Promise.all(
                updateResourceGroupOrdersDto.orders.map((order) =>
                    this.domainResourceGroupService.update(
                        order.resourceGroupId,
                        { order: order.newOrder },
                        { queryRunner },
                    ),
                ),
            );

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async 자원그룹을_삭제한다(resourceGroupId: string): Promise<void> {
        const group = await this.domainResourceGroupService.findOne({
            where: { resourceGroupId },
        });

        if (!group) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.RESOURCE_GROUP.NOT_FOUND);
        }

        // 하위 그룹이 있는지 확인
        const childGroups = await this.domainResourceGroupService.findAll({
            where: { parentResourceGroupId: resourceGroupId },
        });

        if (childGroups.length > 0) {
            throw new Error('하위 그룹이 있는 그룹은 삭제할 수 없습니다.');
        }

        // 자원이 있는지 확인
        const resources = await this.domainResourceService.findAll({
            where: { resourceGroupId },
        });

        if (resources.length > 0) {
            throw new Error('자원이 있는 그룹은 삭제할 수 없습니다.');
        }

        await this.domainResourceGroupService.delete(resourceGroupId);
    }
}
