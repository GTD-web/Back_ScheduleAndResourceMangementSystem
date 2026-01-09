import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckAvailabilityQueryDto {
    @ApiProperty({ description: '자원 ID' })
    @IsUUID()
    resourceId: string;

    @ApiProperty({ description: '예약 시작 시간' })
    @IsString()
    startDate: string;

    @ApiProperty({ description: '예약 종료 시간' })
    @IsString()
    endDate: string;

    @ApiProperty({ description: '예약 ID', required: false })
    @IsUUID()
    @IsOptional()
    reservationId?: string;
}
