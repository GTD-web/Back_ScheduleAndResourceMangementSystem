import { ApiProperty } from '@nestjs/swagger';

export class ReservationVehicleInfoResponseDto {
    @ApiProperty()
    reservationVehicleId: string;

    @ApiProperty()
    vehicleInfoId: string;

    @ApiProperty()
    startOdometer: number;

    @ApiProperty()
    endOdometer: number;

    @ApiProperty()
    startFuelLevel: number;

    @ApiProperty()
    endFuelLevel: number;

    @ApiProperty()
    isReturned: boolean;

    @ApiProperty()
    returnedAt: Date;
}
