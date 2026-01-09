import { ApiProperty } from '@nestjs/swagger';
import { File } from '../../../domain/file/file.entity';

export class ReservationVehicleFileResponseDto {
    @ApiProperty()
    parkingLocationImages: File[];

    @ApiProperty()
    odometerImages: File[];

    @ApiProperty()
    indoorImages: File[];
}
