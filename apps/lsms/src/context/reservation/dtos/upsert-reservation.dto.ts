import { IsNumber, IsString, IsDate, IsOptional, IsArray, MinLength, MaxLength, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 예약 생성 DTO
 *
 * 새로운 예약을 생성할 때 사용하는 데이터 전송 객체입니다.
 * 자원 정보는 ID만 참조하여 loose coupling을 유지합니다.
 */
export class UpsertReservationDto {
    @ApiProperty({
        description: '예약 ID',
        example: '1',
    })
    @IsString()
    @IsUUID()
    @IsOptional()
    reservationId?: string;

    @ApiProperty({
        description: '예약할 자원 ID',
        example: '1',
    })
    @IsString()
    @IsUUID()
    @IsOptional()
    resourceId?: string;

    @ApiProperty({
        description: '예약 시작 날짜/시간',
        example: '2024-02-01T09:00:00Z',
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    startDate?: Date;

    @ApiProperty({
        description: '예약 종료 날짜/시간',
        example: '2024-02-01T18:00:00Z',
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    endDate?: Date;

    @ApiProperty({
        description: '예약 참가자 ID 목록 (예약자 본인 제외)',
        example: ['1', '2', '3'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsUUID(4, { each: true })
    participantIds?: string[];
}
