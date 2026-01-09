import { ApiProperty } from '@nestjs/swagger';

export class EquipmentInfoResponseDto {
    @ApiProperty()
    equipmentInfoId: string;

    @ApiProperty()
    resourceId: string;
}
