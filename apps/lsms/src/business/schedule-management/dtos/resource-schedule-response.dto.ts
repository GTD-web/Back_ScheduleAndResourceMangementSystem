import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '../../../../libs/enums/resource-type.enum';
import { ParticipantsType } from '../../../../libs/enums/reservation-type.enum';
import { Schedule } from '../../../domain/schedule/schedule.entity';
import { Resource } from '../../../domain/resource/resource.entity';
import { Reservation } from '../../../domain/reservation/reservation.entity';
import { ResourceGroup } from '../../../domain/resource-group/resource-group.entity';
import { ScheduleParticipantsWithEmployee } from '../../../context/schedule/services/schedule-query.context.service';

export class ResourceScheduleItemDto {
    @ApiProperty({
        description: '일정 ID',
        example: 'uuid-string',
    })
    scheduleId: string;

    @ApiProperty({
        description: '일정 제목',
        example: '프로젝트 회의',
    })
    title: string;

    @ApiProperty({
        description: '일정 설명',
        required: false,
        example: '주간 진행사항 점검',
    })
    description?: string;

    @ApiProperty({
        description: '시작 날짜 및 시간',
        example: '2024-01-15T09:00:00Z',
    })
    startDate: Date;

    @ApiProperty({
        description: '종료 날짜 및 시간',
        example: '2024-01-15T10:00:00Z',
    })
    endDate: Date;

    @ApiProperty({
        description: '예약자 이름',
        example: '홍길동',
    })
    reserverName: string;

    @ApiProperty({
        description: '내 일정 여부',
        example: true,
    })
    isMine: boolean;

    /**
     * 일정 아이템 DTO 생성
     */
    static fromScheduleData(
        scheduleData: {
            schedule: Schedule;
            participants?: ScheduleParticipantsWithEmployee[];
        },
        currentEmployeeId: string,
    ): ResourceScheduleItemDto {
        const dto = new ResourceScheduleItemDto();
        const { schedule, participants } = scheduleData;

        // 예약자 찾기
        const reserver = participants?.find((p) => p.type === ParticipantsType.RESERVER);

        dto.scheduleId = schedule.scheduleId;
        dto.title = schedule.title;
        dto.description = schedule.description;
        dto.startDate = schedule.startDate;
        dto.endDate = schedule.endDate;
        dto.reserverName = reserver?.employee?.name || '알 수 없음';
        dto.isMine = reserver?.employeeId === currentEmployeeId;

        return dto;
    }
}

export class ResourceInfoDto {
    @ApiProperty({
        description: '자원 ID',
        example: 'uuid-string',
    })
    resourceId: string;

    @ApiProperty({
        description: '자원명',
        example: '회의실 A',
    })
    resourceName: string;

    @ApiProperty({
        description: '자원 설명',
        required: false,
        example: '10인용 대회의실',
    })
    resourceDescription?: string;

    @ApiProperty({
        description: '자원 사용 가능 여부',
        required: false,
        example: true,
    })
    isAvailable?: boolean;

    @ApiProperty({
        description: '자원 사용 불가능 이유',
        required: false,
        example: '자원 사용 불가능',
    })
    unavailableReason?: string;

    @ApiProperty({
        description: '해당 자원의 일정 목록',
        type: [ResourceScheduleItemDto],
    })
    schedules: ResourceScheduleItemDto[];

    /**
     * 자원 상세 DTO 생성
     */
    static fromResourceAndSchedules(
        resource: Resource,
        scheduleDataList: {
            schedule: Schedule;
            participants?: ScheduleParticipantsWithEmployee[];
        }[],
        currentEmployeeId: string,
    ): ResourceInfoDto {
        const dto = new ResourceInfoDto();

        dto.resourceId = resource.resourceId;
        dto.resourceName = resource.name;
        dto.resourceDescription = resource.description;
        dto.isAvailable = resource.isAvailable;
        dto.unavailableReason = resource.unavailableReason;
        dto.schedules = scheduleDataList.map((scheduleData) =>
            ResourceScheduleItemDto.fromScheduleData(scheduleData, currentEmployeeId),
        );

        return dto;
    }
}

export class ResourceGroupDto {
    @ApiProperty({
        description: '자원 그룹 ID',
        example: 'uuid-string',
    })
    resourceGroupId: string;

    @ApiProperty({
        description: '자원 그룹명',
        example: '본사 회의실',
    })
    resourceGroupName: string;

    @ApiProperty({
        description: '자원 그룹 설명',
        required: false,
        example: '본사 건물 내 회의실 그룹',
    })
    resourceGroupDescription?: string;

    @ApiProperty({ description: '자원 그룹 순서', example: 1 })
    order: number;

    @ApiProperty({
        description: '해당 그룹의 자원 목록',
        type: [ResourceInfoDto],
    })
    resources: ResourceInfoDto[];

    /**
     * 자원 그룹 DTO 생성
     */
    static fromResourceGroupAndData(
        resourceGroup: ResourceGroup,
        resources: Resource[],
        scheduleDataMap: Map<
            string,
            {
                schedule: Schedule;
                participants?: ScheduleParticipantsWithEmployee[];
            }[]
        >,
        currentEmployeeId: string,
    ): ResourceGroupDto {
        const dto = new ResourceGroupDto();

        dto.resourceGroupId = resourceGroup.resourceGroupId;
        dto.resourceGroupName = resourceGroup.title;
        dto.resourceGroupDescription = resourceGroup.description;
        dto.order = resourceGroup.order;
        dto.resources = resources.map((resource) => {
            const resourceSchedules = scheduleDataMap.get(resource.resourceId) || [];
            return ResourceInfoDto.fromResourceAndSchedules(resource, resourceSchedules, currentEmployeeId);
        });

        return dto;
    }

    /**
     * 자원 그룹 배열을 DTO 배열로 변환
     */
    static fromResourceGroupsAndData(
        resourceGroups: ResourceGroup[],
        resourceMap: Map<string, Resource[]>,
        scheduleDataList: {
            schedule: Schedule;
            reservation?: Reservation;
            resource?: Resource;
            participants?: ScheduleParticipantsWithEmployee[];
        }[],
        currentEmployeeId: string,
    ): ResourceGroupDto[] {
        // 자원별 일정 데이터 맵 생성
        const scheduleDataMap = new Map<
            string,
            {
                schedule: Schedule;
                participants?: ScheduleParticipantsWithEmployee[];
            }[]
        >();

        scheduleDataList.forEach(({ schedule, resource, participants }) => {
            if (resource) {
                if (!scheduleDataMap.has(resource.resourceId)) {
                    scheduleDataMap.set(resource.resourceId, []);
                }
                scheduleDataMap.get(resource.resourceId)!.push({
                    schedule,
                    participants,
                });
            }
        });

        // 자원 그룹별 DTO 생성
        const resourceGroupDtos = resourceGroups.map((group) => {
            const resources = resourceMap.get(group.resourceGroupId) || [];
            return ResourceGroupDto.fromResourceGroupAndData(group, resources, scheduleDataMap, currentEmployeeId);
        });

        return resourceGroupDtos.sort((a, b) => a.order - b.order);
    }
}

export class ResourceScheduleResponseDto {
    @ApiProperty({ description: '자원 유형', enum: ResourceType, example: ResourceType.MEETING_ROOM })
    type: ResourceType;

    @ApiProperty({
        description: '자원 그룹별 일정 목록',
        type: [ResourceGroupDto],
    })
    resourceGroups: ResourceGroupDto[];
}
