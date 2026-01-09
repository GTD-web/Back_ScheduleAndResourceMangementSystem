import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateEquipmentInfoDto {
    @ApiProperty({
        description: '장비 ID',
        example: 'equipment-123',
    })
    equipmentInfoId: string;
}
