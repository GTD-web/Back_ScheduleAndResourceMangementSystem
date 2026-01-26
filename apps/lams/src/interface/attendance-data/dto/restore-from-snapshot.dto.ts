import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * 스냅샷으로부터 복원 요청 DTO
 */
export class RestoreFromSnapshotRequestDto {
    @ApiProperty({
        description: '스냅샷 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    snapshotId: string;
}

/**
 * 스냅샷으로부터 복원 응답 DTO
 */
export class RestoreFromSnapshotResponseDto {
    @ApiProperty({ description: '연도' })
    year: string;

    @ApiProperty({ description: '월' })
    month: string;

}
