import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { VehicleInfoService } from '../../services/vehicle-info.service';
import { ReturnVehicleDetailResponseDto } from '../../dtos/vehicle/return-vehicle-response.dto';

@ApiTags('v2 차량 예약 정보')
@Controller('v2/reservation-vehicle')
@ApiBearerAuth()
export class ReservationVehicleController {
    constructor(private readonly vehicleInfoService: VehicleInfoService) {}

    // 차량 반납 상세 조회
    @Get(':reservationVehicleId')
    @ApiOperation({ summary: '차량 반납 상세 조회' })
    @ApiOkResponse({
        status: 200,
        description: '차량 반납 상세를 성공적으로 조회했습니다.',
        type: ReturnVehicleDetailResponseDto,
    })
    async findReturnDetail(
        @Param('reservationVehicleId') reservationVehicleId: string,
    ): Promise<ReturnVehicleDetailResponseDto> {
        return this.vehicleInfoService.findReturnDetail(reservationVehicleId);
    }
}
