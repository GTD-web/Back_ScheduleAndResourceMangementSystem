import { Controller, Get, Post, Delete, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiOkResponse } from '@nestjs/swagger';

import { ResourceType } from '../../../../../libs/enums/resource-type.enum';

import { CreateResourceGroupDto } from '../../dtos/resource/create-resource.dto';
import {
    ResourceGroupResponseDto,
    ResourceGroupWithResourcesResponseDto,
} from '../../dtos/resource/resource-response.dto';
import { UpdateResourceGroupDto, UpdateResourceGroupOrdersDto } from '../../dtos/resource/update-resource.dto';

import { ResourceGroupService } from '../../services/resource-group.service';

@ApiTags('v2 자원 그룹')
@Controller('v2/resource-groups')
@ApiBearerAuth()
export class ResourceGroupController {
    constructor(private readonly resourceGroupService: ResourceGroupService) {}

    @Get('parents')
    @ApiOperation({ summary: '상위그룹 목록 조회 #사용자/자원구분/모달' })
    @ApiOkResponse({
        description: '상위 자원 그룹 목록을 조회했습니다.',
        type: [ResourceGroupResponseDto],
    })
    async findParentResourceGroups(): Promise<ResourceGroupResponseDto[]> {
        return this.resourceGroupService.findParentResourceGroups();
    }

    @Get('resources')
    @ApiOperation({ summary: '상위그룹-하위그룹-자원 목록 조회 #사용자/자원선택/모달 #관리자/자원관리/자원목록' })
    @ApiOkResponse({
        description: '자원 그룹들과 각 그룹에 속한 자원 목록을 조회했습니다.',
        type: [ResourceGroupWithResourcesResponseDto],
    })
    @ApiQuery({ name: 'type', enum: ResourceType, required: false })
    async findAll(@Query('type') type: ResourceType): Promise<ResourceGroupWithResourcesResponseDto[]> {
        return this.resourceGroupService.findResourceGroupsWithResourceData(type);
    }

    @Post()
    @ApiOperation({ summary: '자원 그룹 생성' })
    @ApiOkResponse({
        status: 201,
        description: '자원 그룹이 생성되었습니다.',
        type: ResourceGroupResponseDto,
    })
    async create(@Body() createResourceGroupDto: CreateResourceGroupDto): Promise<ResourceGroupResponseDto> {
        return this.resourceGroupService.createResourceGroup(createResourceGroupDto);
    }

    @Patch('order')
    @ApiOperation({ summary: '자원 그룹 순서 변경' })
    @ApiOkResponse({
        status: 200,
        description: '자원 그룹 순서가 성공적으로 변경되었습니다.',
    })
    async updateOrder(@Body() updateResourceGroupOrdersDto: UpdateResourceGroupOrdersDto) {
        return this.resourceGroupService.reorderResourceGroups(updateResourceGroupOrdersDto);
    }

    @Patch(':resourceGroupId')
    @ApiOperation({ summary: '자원 그룹 수정' })
    @ApiOkResponse({
        description: '자원 그룹이 수정되었습니다.',
        type: ResourceGroupResponseDto,
    })
    async update(
        @Param('resourceGroupId') resourceGroupId: string,
        @Body() updateResourceGroupDto: UpdateResourceGroupDto,
    ): Promise<ResourceGroupResponseDto> {
        return this.resourceGroupService.updateResourceGroup(resourceGroupId, updateResourceGroupDto);
    }

    @Delete(':resourceGroupId')
    @ApiOperation({ summary: '자원 그룹 삭제' })
    @ApiOkResponse({
        description: '자원 그룹이 삭제되었습니다.',
    })
    async remove(@Param('resourceGroupId') resourceGroupId: string): Promise<void> {
        return this.resourceGroupService.deleteResourceGroup(resourceGroupId);
    }
}
