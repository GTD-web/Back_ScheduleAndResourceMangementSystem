import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ResourceLocationURL } from '../resource/create-resource.dto';

export class UpdateAccommodationInfoDto {
    @ApiProperty({
        description: '숙박시설 ID',
        example: 'accommodation-123',
    })
    accommodationInfoId: string;

    @ApiProperty({ type: ResourceLocationURL, required: false })
    @IsOptional()
    locationURLs?: ResourceLocationURL;
}
