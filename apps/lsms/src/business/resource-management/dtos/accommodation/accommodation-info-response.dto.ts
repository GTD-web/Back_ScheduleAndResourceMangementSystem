import { ApiProperty } from '@nestjs/swagger';

export class AccommodationInfoResponseDto {
    @ApiProperty()
    accommodationInfoId: string;

    @ApiProperty()
    resourceId: string;
}
