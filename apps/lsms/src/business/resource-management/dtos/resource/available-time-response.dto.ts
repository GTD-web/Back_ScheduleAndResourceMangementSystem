import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '../../../../../libs/enums/resource-type.enum';

/**
 * 시간 슬롯을 표시하는 DTO
 */
export class TimeSlotDto {
    @ApiProperty({
        description: '시작 시간 (ISO 문자열)',
        example: '2025-01-01T09:00:00',
    })
    startTime: string;

    @ApiProperty({
        description: '종료 시간 (ISO 문자열)',
        example: '2025-01-01T10:00:00',
    })
    endTime: string;
}

/**
 * 자원별 가용 시간 정보를 담는 DTO
 */
export class ResourceAvailabilityDto {
    @ApiProperty({
        description: '자원 ID',
        example: '78117aaf-a203-43a3-bb38-51ec91ca935a',
    })
    resourceId: string;

    @ApiProperty({
        description: '자원 이름',
        example: '회의실 A',
    })
    resourceName: string;

    @ApiProperty({
        required: false,
        description: '자원 위치',
        example: '서울특별시 강남구 테헤란로 14길 6 남도빌딩 3층',
    })
    resourceLocation?: string;

    @ApiProperty({
        required: false,
        description: '가용 시간 슬롯 목록',
        type: [TimeSlotDto],
    })
    availableTimeSlots?: TimeSlotDto[];

    @ApiProperty({
        required: false,
        description: '자원 그룹 이름',
        example: '회의실 그룹',
    })
    resourceGroupName?: string;
}
