import { ScheduleCreateRequestListDto, ScheduleCreateRequestDto } from '../dtos/schedule-create-request.dto';
import { ScheduleType } from '../../../../libs/enums/schedule-type.enum';
import { ResourceType } from '../../../../libs/enums/resource-type.enum';

/**
 * 일정 생성 테스트 데이터 생성 함수
 * @param projectIds 실제 프로젝트 ID 배열
 * @param reserverEmployeeId 예약자 직원 ID
 * @param participantEmployeeIds 참석자 직원 ID 배열
 * @param meetingRoomResourceId 회의실 자원 ID (optional)
 * @returns ScheduleCreateRequestListDto 테스트 데이터
 */
export function createScheduleTestData(
    projectIds: string[],
    reserverEmployeeId: string,
    participantEmployeeIds: string[],
    meetingRoomResourceId?: string,
): ScheduleCreateRequestListDto {
    const schedules: ScheduleCreateRequestDto[] = [];

    // 2025년 9월 23일부터 10월 10일까지
    const startDate = new Date(2025, 8, 23); // 9월은 8 (0-based index)
    const endDate = new Date(2025, 9, 10); // 10월은 9

    const currentDate = new Date(startDate);

    // 회의 제목 목록
    const meetingTitles = [
        '업무 계획 회의',
        '프로젝트 진행 상황 검토',
        '팀 브리핑',
        '업무 논의',
        '주간 회의',
        '월간 리뷰',
        '기획 회의',
        '아이디어 논의',
        '실무 협의',
        '업무 조정 회의',
        '진행 상황 공유',
        '협업 논의',
        '업무 개선 회의',
        '계획 수립',
        '성과 검토',
        '개선 방안 논의',
        '업무 분담 회의',
        '목표 설정 회의',
    ];

    // 회의실 위치 목록
    const locations = [
        '1층 회의실 A',
        '2층 회의실 B',
        '3층 회의실 C',
        '4층 대회의실',
        '5층 소회의실',
        '1층 프로젝트룸',
        '2층 미팅룸',
        '3층 세미나실',
    ];

    let scheduleIndex = 0;

    while (currentDate <= endDate) {
        // 주말 제외 (토요일: 6, 일요일: 0)
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            // 시작 시간: 09:00~16:00 사이에서 30분 단위로 랜덤 선택
            const startHours = [9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16];
            const randomStartTime = startHours[scheduleIndex % startHours.length];
            const startHour = Math.floor(randomStartTime);
            const startMinute = (randomStartTime % 1) * 60;

            // 회의 시간: 1~3시간 사이에서 30분 단위로 선택
            const durations = [1, 1.5, 2, 2.5, 3]; // 시간 단위
            const duration = durations[scheduleIndex % durations.length];
            const endTime = randomStartTime + duration;
            const endHour = Math.floor(endTime);
            const endMinute = (endTime % 1) * 60;

            // 18:00 이후로 넘어가지 않도록 체크
            if (endTime <= 18) {
                const schedule: ScheduleCreateRequestDto = {
                    datesSelection: [
                        {
                            startDate: new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                currentDate.getDate(),
                                startHour,
                                startMinute,
                            ).toISOString(),
                            endDate: new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                currentDate.getDate(),
                                endHour,
                                endMinute,
                            ).toISOString(),
                        },
                    ],
                    title: meetingTitles[scheduleIndex % meetingTitles.length],
                    description: `${duration}시간 개인 업무 회의입니다.`,
                    location: locations[scheduleIndex % locations.length],
                    notifyBeforeStart: true,
                    notificationMinutes: [15],
                    scheduleType: ScheduleType.PERSONAL,
                    participants: participantEmployeeIds.map((id) => ({ employeeId: id })),
                    projectSelection: projectIds[0]
                        ? { projectId: projectIds[scheduleIndex % projectIds.length] }
                        : undefined,
                    resourceSelection: meetingRoomResourceId
                        ? {
                              resourceType: ResourceType.MEETING_ROOM,
                              resourceId: meetingRoomResourceId,
                          }
                        : undefined,
                };

                schedules.push(schedule);
                scheduleIndex++;
            }
        }

        // 다음 날로 이동
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
        schedules: schedules,
    };
}

/**
 * 간단한 테스트 데이터 생성 (프로젝트 ID 없이)
 * @param reserverEmployeeId 예약자 직원 ID
 * @param participantEmployeeIds 참석자 직원 ID 배열
 * @param meetingRoomResourceId 회의실 자원 ID (optional)
 * @returns ScheduleCreateRequestListDto 테스트 데이터
 */
export function createSimpleScheduleTestData(
    projectIds: string[],
    reserverEmployeeId: string,
    participantEmployeeIds: string[],
    meetingRoomResourceId?: string,
): ScheduleCreateRequestListDto {
    return createScheduleTestData(projectIds, reserverEmployeeId, participantEmployeeIds, meetingRoomResourceId);
}
