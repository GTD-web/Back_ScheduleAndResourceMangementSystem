import { ApiProperty } from '@nestjs/swagger';

class Location {
    @ApiProperty()
    address: string;

    @ApiProperty()
    detailAddress: string;
}

export class ReturnVehicleResponseDto {
    @ApiProperty()
    reservationVehicleId: string;

    @ApiProperty()
    returnedAt: Date;

    @ApiProperty({ type: () => Location })
    location: Location;

    @ApiProperty()
    returnedBy: string;

    @ApiProperty()
    endOdometer: number;
}

export class ReturnVehicleDetailResponseDto extends ReturnVehicleResponseDto {
    @ApiProperty()
    parkingLocationImages: string[];

    @ApiProperty()
    odometerImages: string[];

    @ApiProperty()
    indoorImages: string[];
}
