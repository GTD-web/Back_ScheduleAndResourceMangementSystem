import { Injectable } from '@nestjs/common';
import { ResourceType } from '../../../../libs/enums/resource-type.enum';

// Context Services
import { ResourceGroupContextService } from '../../../context/resource/services/resource-group.context.service';

// DTOs
import { CreateResourceGroupDto } from '../dtos/resource/create-resource.dto';
import {
    ResourceGroupResponseDto,
    ResourceGroupWithResourcesResponseDto,
} from '../dtos/resource/resource-response.dto';
import { UpdateResourceGroupDto, UpdateResourceGroupOrdersDto } from '../dtos/resource/update-resource.dto';

@Injectable()
export class ResourceGroupService {
    constructor(private readonly resourceGroupContextService: ResourceGroupContextService) {}

    // Admin Resource Group Controller
    async findParentResourceGroups(): Promise<ResourceGroupResponseDto[]> {
        return this.resourceGroupContextService.상위_자원그룹을_조회한다();
    }

    async findResourceGroupsWithResourceData(type: ResourceType): Promise<ResourceGroupWithResourcesResponseDto[]> {
        return this.resourceGroupContextService.자원데이터포함_그룹목록을_조회한다(type);
    }

    async createResourceGroup(createResourceGroupDto: CreateResourceGroupDto): Promise<ResourceGroupResponseDto> {
        return this.resourceGroupContextService.자원그룹을_생성한다(createResourceGroupDto);
    }

    async reorderResourceGroups(updateResourceGroupOrdersDto: UpdateResourceGroupOrdersDto): Promise<void> {
        return this.resourceGroupContextService.자원그룹_순서를_변경한다(updateResourceGroupOrdersDto);
    }

    async updateResourceGroup(
        resourceGroupId: string,
        updateResourceGroupDto: UpdateResourceGroupDto,
    ): Promise<ResourceGroupResponseDto> {
        return this.resourceGroupContextService.자원그룹을_수정한다(resourceGroupId, updateResourceGroupDto);
    }

    async deleteResourceGroup(resourceGroupId: string): Promise<void> {
        return this.resourceGroupContextService.자원그룹을_삭제한다(resourceGroupId);
    }

    // User Resource Group Controller
    async findParentResourceGroupsForUser(): Promise<ResourceGroupResponseDto[]> {
        return this.resourceGroupContextService.상위_자원그룹을_조회한다();
    }

    async findResourceGroupsWithResourceDataForUser(
        type: ResourceType,
    ): Promise<ResourceGroupWithResourcesResponseDto[]> {
        return this.resourceGroupContextService.자원데이터포함_그룹목록을_조회한다(type);
    }
}
