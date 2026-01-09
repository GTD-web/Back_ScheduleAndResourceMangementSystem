import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '../../../../libs/enums/resource-type.enum';
import { IsBoolean, IsOptional } from 'class-validator';
import { IsEnum } from 'class-validator';
import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ReservationQueryDto {
    @ApiProperty({ required: false })
    @IsString()
    startDate: string;

    @ApiProperty({ required: false })
    @IsString()
    endDate: string;

    @ApiProperty({ enum: ResourceType, required: false })
    @IsEnum(ResourceType)
    @IsOptional()
    resourceType?: ResourceType;

    @ApiProperty({ required: false, type: Boolean })
    @IsBoolean()
    @IsOptional()
    isMine?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsBoolean()
    @IsOptional()
    isMySchedules?: boolean;
}
