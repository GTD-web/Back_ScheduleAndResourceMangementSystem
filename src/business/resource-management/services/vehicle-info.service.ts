import { Injectable } from '@nestjs/common';

// Context Services
import { VehicleInfoContextService } from '../../../context/resource/services/vehicle-info.context.service';
import { FileContextService } from '../../../context/file/services/file.context.service';

// DTOs
import { UpdateVehicleInfoDto } from '../dtos/vehicle/update-vehicle-info.dto';
import { VehicleInfoResponseDto } from '../dtos/vehicle/vehicle-response.dto';
import { ReturnVehicleDetailResponseDto, ReturnVehicleResponseDto } from '../../../business.dto.index';

@Injectable()
export class VehicleInfoService {
    constructor(
        private readonly vehicleInfoContextService: VehicleInfoContextService,
        private readonly fileContextService: FileContextService,
    ) {}

    async findVehicleInfo(vehicleInfoId: string): Promise<VehicleInfoResponseDto> {
        return this.vehicleInfoContextService.차량정보를_조회한다(vehicleInfoId);
    }

    async updateVehicleInfo(
        vehicleInfoId: string,
        updateVehicleInfoDto: UpdateVehicleInfoDto,
    ): Promise<VehicleInfoResponseDto> {
        return this.vehicleInfoContextService.차량정보를_수정한다(vehicleInfoId, updateVehicleInfoDto);
    }

    async findReturnList(vehicleInfoId: string): Promise<ReturnVehicleResponseDto[]> {
        const returnList = await this.vehicleInfoContextService.반납_리스트를_조회한다(vehicleInfoId);
        return returnList.map((returnVehicle) => {
            return {
                reservationVehicleId: returnVehicle.reservationVehicleId,
                returnedAt: returnVehicle.returnedAt,
                returnedBy: returnVehicle.returnedBy,
                endOdometer: returnVehicle.endOdometer,
                location: returnVehicle.location,
                remarks: returnVehicle.remarks,
            };
        });
    }

    async findReturnDetail(reservationVehicleId: string): Promise<ReturnVehicleDetailResponseDto> {
        const returnDetail = await this.vehicleInfoContextService.반납_상세정보를_조회한다(reservationVehicleId);
        const reservationVehicleFile = await this.fileContextService.차량예약_파일을_조회한다(reservationVehicleId);
        return {
            reservationVehicleId: returnDetail.reservationVehicleId,
            returnedAt: returnDetail.returnedAt,
            returnedBy: returnDetail.returnedBy,
            endOdometer: returnDetail.endOdometer,
            location: returnDetail.location,
            remarks: returnDetail.remarks,
            parkingLocationImages: reservationVehicleFile.parkingLocationImages.map((image) => image.filePath),
            odometerImages: reservationVehicleFile.odometerImages.map((image) => image.filePath),
            indoorImages: reservationVehicleFile.indoorImages.map((image) => image.filePath),
        };
    }
}
