import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { UpdateVehicleInfoDto } from '../../dtos/vehicle/update-vehicle-info.dto';
import { VehicleInfoResponseDto } from '../../dtos/vehicle/vehicle-response.dto';
import { ReturnVehicleResponseDto } from '../../dtos/vehicle/return-vehicle-response.dto';

import { VehicleInfoService } from '../../services/vehicle-info.service';

@ApiTags('v2 차량 정보')
@Controller('v2/vehicle-info')
@ApiBearerAuth()
export class VehicleInfoController {
    constructor(private readonly vehicleInfoService: VehicleInfoService) {}

    @Get(':vehicleInfoId')
    @ApiOperation({ summary: '차량 정보 조회' })
    @ApiOkResponse({
        status: 200,
        description: '차량 정보를 성공적으로 조회했습니다.',
        type: VehicleInfoResponseDto,
    })
    async findVehicleInfo(@Param('vehicleInfoId') vehicleInfoId: string): Promise<VehicleInfoResponseDto> {
        return this.vehicleInfoService.findVehicleInfo(vehicleInfoId);
    }

    @Patch(':vehicleInfoId')
    @ApiOperation({ summary: '차량 정보 수정' })
    @ApiOkResponse({
        status: 200,
        description: '차량 정보가 성공적으로 수정되었습니다.',
        type: VehicleInfoResponseDto,
    })
    async update(
        @Param('vehicleInfoId') vehicleInfoId: string,
        @Body() updateVehicleInfoDto: UpdateVehicleInfoDto,
    ): Promise<VehicleInfoResponseDto> {
        return this.vehicleInfoService.updateVehicleInfo(vehicleInfoId, updateVehicleInfoDto);
    }

    // 차량 반납 리스트
    @Get(':vehicleInfoId/return-list')
    @ApiOperation({ summary: '차량 반납 리스트 조회' })
    @ApiOkResponse({
        status: 200,
        description: '차량 반납 리스트를 성공적으로 조회했습니다.',
        type: [ReturnVehicleResponseDto],
    })
    async findReturnList(@Param('vehicleInfoId') vehicleInfoId: string): Promise<ReturnVehicleResponseDto[]> {
        return this.vehicleInfoService.findReturnList(vehicleInfoId);
    }
}
