import { Controller, Get, Post, Delete, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { CreateConsumableDto } from '../../dtos/vehicle/create-vehicle-info.dto';
import { UpdateConsumableDto } from '../../dtos/vehicle/update-vehicle-info.dto';
import { ConsumableResponseDto } from '../../dtos/vehicle/vehicle-response.dto';

import { ConsumableService } from '../../services/consumable.service';

@ApiTags('v2 차량 소모품')
@Controller('v2/consumables')
@ApiBearerAuth()
export class ConsumableController {
    constructor(private readonly consumableService: ConsumableService) {}

    @Post()
    @ApiOperation({ summary: '소모품 등록' })
    @ApiOkResponse({
        status: 201,
        description: '소모품이 성공적으로 등록되었습니다.',
        type: ConsumableResponseDto,
    })
    async create(@Body() createConsumableDto: CreateConsumableDto): Promise<ConsumableResponseDto> {
        return this.consumableService.save(createConsumableDto);
    }

    @Get('vehicle/:vehicleInfoId')
    @ApiOperation({ summary: '소모품 목록 조회' })
    @ApiOkResponse({
        status: 200,
        description: '소모품 목록을 성공적으로 조회했습니다.',
        type: [ConsumableResponseDto],
    })
    async findAll(@Param('vehicleInfoId') vehicleInfoId: string): Promise<ConsumableResponseDto[]> {
        return this.consumableService.findAll(vehicleInfoId);
    }

    @Get(':consumableId')
    @ApiOperation({ summary: '소모품 상세 조회' })
    @ApiOkResponse({
        status: 200,
        description: '소모품을 성공적으로 조회했습니다.',
        type: ConsumableResponseDto,
    })
    async findOne(@Param('consumableId') consumableId: string): Promise<ConsumableResponseDto> {
        return this.consumableService.findOne(consumableId);
    }

    @Patch(':consumableId')
    @ApiOperation({ summary: '소모품 수정' })
    @ApiOkResponse({
        status: 200,
        description: '소모품이 성공적으로 수정되었습니다.',
        type: ConsumableResponseDto,
    })
    async update(
        @Param('consumableId') consumableId: string,

        @Body() updateConsumableDto: UpdateConsumableDto,
    ): Promise<ConsumableResponseDto> {
        return this.consumableService.update(consumableId, updateConsumableDto);
    }

    @Delete(':consumableId')
    @ApiOperation({ summary: '소모품 삭제' })
    @ApiOkResponse({
        status: 200,
        description: '소모품이 성공적으로 삭제되었습니다.',
    })
    async remove(@Param('consumableId') consumableId: string): Promise<void> {
        await this.consumableService.delete(consumableId);
    }
}
