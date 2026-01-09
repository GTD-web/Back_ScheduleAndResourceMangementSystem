import { ApiProperty } from '@nestjs/swagger';
import { FileResponseDto } from '../../../../business.dto.index';

export class MaintenanceResponseDto {
    @ApiProperty()
    maintenanceId: string;

    @ApiProperty()
    consumableId: string;

    @ApiProperty({ required: false })
    resourceName?: string;

    @ApiProperty({ required: false })
    consumableName?: string;

    @ApiProperty()
    date: string;

    @ApiProperty()
    mileage: number;

    @ApiProperty()
    cost: number;

    @ApiProperty()
    images: string[];

    @ApiProperty({
        example: [
            {
                fileId: '123e4567-e89b-12d3-a456-426614174000',
                fileName: 'image.jpg',
                filePath: 'uploads/20250226123456-image.jpg',
            },
        ],
        type: [FileResponseDto],
        required: false,
    })
    imageFiles?: FileResponseDto[];

    @ApiProperty({ required: false })
    mileageFromLastMaintenance?: number;

    @ApiProperty({ required: false })
    maintanceRequired?: boolean;

    @ApiProperty({ required: false })
    previousMileage?: number;

    @ApiProperty({ required: false })
    isLatest?: boolean;

    @ApiProperty({ required: false })
    previousDate?: string;
}

export class ConsumableResponseDto {
    @ApiProperty()
    consumableId: string;

    @ApiProperty()
    vehicleInfoId: string;

    @ApiProperty({ description: '소모품 이름' })
    name: string;

    @ApiProperty({ description: '소모품 교체 주기' })
    replaceCycle: number;

    @ApiProperty({ description: '소모품 교체 알림 주기' })
    notifyReplacementCycle: boolean;

    @ApiProperty({ description: '교체 필요 여부 (거리 기반 계산)', required: false })
    isReplacementRequired?: boolean;

    @ApiProperty({ type: [MaintenanceResponseDto], required: false })
    maintenances?: MaintenanceResponseDto[];
}

export interface ParkingCoordinates {
    lat: number;
    lng: number;
}

export class VehicleInfoResponseDto {
    @ApiProperty()
    vehicleInfoId: string;

    @ApiProperty()
    resourceId: string;

    @ApiProperty()
    insuranceName: string;

    @ApiProperty()
    insuranceNumber: string;

    @ApiProperty()
    totalMileage: number;

    @ApiProperty()
    leftMileage: number;

    @ApiProperty()
    parkingLocationImages: string[];

    @ApiProperty()
    odometerImages: string[];

    @ApiProperty()
    indoorImages: string[];

    @ApiProperty()
    parkingCoordinates: ParkingCoordinates;

    @ApiProperty({ type: [FileResponseDto], required: false })
    parkingLocationFiles?: FileResponseDto[];

    @ApiProperty({ type: [FileResponseDto], required: false })
    odometerFiles?: FileResponseDto[];

    @ApiProperty({ type: [FileResponseDto], required: false })
    indoorFiles?: FileResponseDto[];

    @ApiProperty({ type: [ConsumableResponseDto], required: false })
    consumables?: ConsumableResponseDto[];
}
