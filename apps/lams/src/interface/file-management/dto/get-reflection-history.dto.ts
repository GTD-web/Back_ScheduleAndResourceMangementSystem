import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * 반영이력 조회 요청 DTO
 */
export class GetReflectionHistoryRequestDto {
    @ApiProperty({
        description: '파일 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true,
    })
    @IsUUID()
    @IsNotEmpty()
    fileId: string;
}

/**
 * 파일 내용 반영이력 응답 DTO
 */
export class ReflectionHistoryResponseDto {
    @ApiProperty({ description: 'ID' })
    id: string;

    @ApiProperty({ description: '파일 ID' })
    fileId: string;

    @ApiProperty({ description: '데이터 스냅샷 정보 ID', nullable: true })
    dataSnapshotInfoId: string | null;

    @ApiProperty({ description: '추가 정보', nullable: true })
    info: string | null;

    @ApiProperty({ description: '생성 일시' })
    createdAt: Date;

    @ApiProperty({ description: '반영 일시', nullable: true })
    reflectedAt: Date | null;

    @ApiProperty({ description: '수정 일시' })
    updatedAt: Date;

    @ApiProperty({ description: '삭제 일시', nullable: true })
    deletedAt?: Date;

    @ApiProperty({ description: '생성자 ID', nullable: true })
    createdBy?: string;

    @ApiProperty({ description: '수정자 ID', nullable: true })
    updatedBy?: string;

    @ApiProperty({ description: '버전' })
    version: number;
}

/**
 * 반영이력 조회 응답 DTO
 */
export class GetReflectionHistoryResponseDto {
    @ApiProperty({
        description: '반영이력 목록',
        type: [ReflectionHistoryResponseDto],
    })
    reflectionHistories: ReflectionHistoryResponseDto[];
}
