import { Injectable, BadRequestException } from '@nestjs/common';
import { Schedule } from '../../../../libs/entities/schedule.entity';
import { Reservation } from '../../../../libs/entities/reservation.entity';
import { ReservationStatus } from '../../../../libs/enums/reservation-type.enum';
import { DateUtil } from '../../../../libs/utils/date.util';
import { DomainReservationService } from '../../../domain/reservation/reservation.service';
import { ScheduleStatus } from '../../../../libs/enums/schedule-type.enum';

export interface PolicyResult {
    isAllowed: boolean;
    reason?: string;
    reasonCode?: string;
}

export interface ScheduleExtendRequest {
    newEndDate: Date;
}

export interface ScheduleUpdateRequest {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    notifyBeforeStart?: boolean;
    notifyMinutesBeforeStart?: number[];
}

export interface ScheduleCreateRequest {
    title: string;
    description?: string;
    location?: string;
    scheduleType: string;
    participants: { employeeId: string }[];
    datesSelection: { startDate: string; endDate: string }[];
    resourceSelection?: {
        resourceId: string;
        resourceType: string;
    };
    projectSelection?: {
        projectId: string;
    };
}

// 타입 정의
export interface UpdateScenarios {
    isDateUpdate: boolean; // 날짜 변경
    isInfoUpdate: boolean; // 정보 변경
    isResourceUpdate: boolean; // 자원 변경
}

@Injectable()
export class SchedulePolicyService {
    constructor(private readonly domainReservationService: DomainReservationService) {}

    /**
     * 일정 취소 가능 여부를 판단합니다
     */
    async 일정_취소가_가능한지_확인한다(schedule: Schedule, reservation?: Reservation): Promise<PolicyResult> {
        const now = DateUtil.now().toDate();

        // 2. 일정 상태 체크 - 이미 진행 중이거나 완료된 일정은 취소 불가
        if (schedule.startDate <= now || schedule.status === ScheduleStatus.PROCESSING) {
            return {
                isAllowed: false,
                reason: '이미 시작된 일정은 취소할 수 없습니다.',
                reasonCode: 'SCHEDULE_ALREADY_STARTED',
            };
        }

        // 3. 예약 상태 체크 (예약이 있는 경우)
        if (reservation) {
            if (reservation.status === ReservationStatus.CANCELLED) {
                return {
                    isAllowed: false,
                    reason: '이미 취소된 예약입니다.',
                    reasonCode: 'RESERVATION_ALREADY_CANCELLED',
                };
            }

            if (reservation.status === ReservationStatus.CLOSED) {
                return {
                    isAllowed: false,
                    reason: '이미 완료된 예약은 취소할 수 없습니다.',
                    reasonCode: 'RESERVATION_ALREADY_COMPLETED',
                };
            }
        }

        return { isAllowed: true };
    }

    /**
     * 일정 완료 가능 여부를 판단합니다
     */
    async 일정_완료가_가능한지_확인한다(schedule: Schedule, reservation?: Reservation): Promise<PolicyResult> {
        const now = DateUtil.now().toDate();

        // 1. 시간 정책 체크 - 일정이 시작되어야 완료 가능
        if (schedule.startDate > now || schedule.status === ScheduleStatus.PENDING) {
            return {
                isAllowed: false,
                reason: '아직 시작되지 않은 일정은 완료할 수 없습니다.',
                reasonCode: 'SCHEDULE_NOT_STARTED',
            };
        }

        // 2. 예약 상태 체크 (예약이 있는 경우)
        if (reservation) {
            if (reservation.status === ReservationStatus.CANCELLED) {
                return {
                    isAllowed: false,
                    reason: '취소된 예약은 완료할 수 없습니다.',
                    reasonCode: 'RESERVATION_CANCELLED',
                };
            }

            if (reservation.status === ReservationStatus.CLOSED) {
                return {
                    isAllowed: false,
                    reason: '이미 완료된 예약입니다.',
                    reasonCode: 'RESERVATION_ALREADY_COMPLETED',
                };
            }

            // 확정된 예약만 완료 가능
            if (reservation.status !== ReservationStatus.USING) {
                return {
                    isAllowed: false,
                    reason: '확정된 예약만 완료할 수 있습니다.',
                    reasonCode: 'INVALID_RESERVATION_STATUS',
                };
            }
        }

        return { isAllowed: true };
    }

    /**
     * 일정 연장 가능 여부를 판단합니다
     */
    async 일정_연장이_가능한지_확인한다(
        schedule: Schedule,
        extendRequest: ScheduleExtendRequest,
        reservation?: Reservation,
    ): Promise<PolicyResult> {
        const now = DateUtil.now().toDate();

        // 1. 시간 정책 체크 - 연장은 현재 시간 이후로만 가능
        if (extendRequest.newEndDate <= now) {
            return {
                isAllowed: false,
                reason: '연장 시간은 현재 시간 이후여야 합니다.',
                reasonCode: 'INVALID_EXTEND_TIME',
            };
        }

        // 2. 기존 종료 시간보다 늦어야 함
        if (extendRequest.newEndDate <= schedule.endDate) {
            return {
                isAllowed: false,
                reason: '연장 시간은 기존 종료 시간보다 늦어야 합니다.',
                reasonCode: 'EXTEND_TIME_TOO_EARLY',
            };
        }

        // 3. 최대 연장 시간 체크 (예: 4시간)
        const maxExtensionHours = 4;
        const maxExtendTime = new Date(schedule.endDate);
        maxExtendTime.setHours(maxExtendTime.getHours() + maxExtensionHours);

        if (extendRequest.newEndDate > maxExtendTime) {
            return {
                isAllowed: false,
                reason: `최대 ${maxExtensionHours}시간까지만 연장 가능합니다.`,
                reasonCode: 'EXCEED_MAX_EXTENSION',
            };
        }

        // 4. 예약이 있는 경우 자원 충돌 체크
        if (reservation) {
            const isAvailable = await this.domainReservationService.checkReservationConflicts(
                reservation.resourceId,
                schedule.endDate, // 기존 종료 시간부터
                extendRequest.newEndDate, // 새로운 종료 시간까지
            );

            if (!isAvailable) {
                return {
                    isAllowed: false,
                    reason: '연장하려는 시간대에 다른 예약이 있습니다.',
                    reasonCode: 'RESOURCE_CONFLICT',
                };
            }
        }

        return { isAllowed: true };
    }

    // /**
    //  * 일정 수정 가능 여부를 판단합니다
    //  */
    // async 일정_수정이_가능한지_확인한다(
    //     schedule: Schedule,
    //     updateRequest: ScheduleUpdateRequest,
    //     reservation?: Reservation,
    // ): Promise<PolicyResult> {
    //     const isAvailable = await this.domainReservationService.checkReservationConflicts(
    //         reservation.resourceId,
    //         newStartDate,
    //         newEndDate,
    //     );

    //     if (!isAvailable) {
    //         return {
    //             isAllowed: false,
    //             reason: '수정하려는 시간대에 다른 예약이 있습니다.',
    //             reasonCode: 'RESOURCE_CONFLICT',
    //         };
    //     }

    //     return { isAllowed: true };
    // }

    /**
     * 다중 일정 생성 가능 여부를 판단합니다 (레거시 로직 유지)
     * - 각 날짜별로 자원 가용성 체크 (레거시에서는 비즈니스 레이어에서 처리)
     * - 여기서는 기본적인 정책만 체크하고, 자원 충돌은 비즈니스 레이어에서 처리
     */
    async 다중_일정_생성이_가능한지_확인한다(createRequest: ScheduleCreateRequest): Promise<PolicyResult> {
        const now = DateUtil.now().toDate();

        // 1. 기본 유효성 체크
        if (!createRequest.datesSelection || createRequest.datesSelection.length === 0) {
            return {
                isAllowed: false,
                reason: '날짜 선택이 필요합니다.',
                reasonCode: 'NO_DATES_SELECTED',
            };
        }

        // 2. 각 날짜별 시간 정책 체크
        for (const dateRange of createRequest.datesSelection) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);

            // 과거 시간 체크 - 현재 시간이 속한 30분 단위 시간대부터 예약 가능 - deprecated 2025-09-22
            // const current30MinStart = new Date(now);
            // const currentMinutes = current30MinStart.getMinutes();

            // if (currentMinutes < 30) {
            //     // 0~29분: 해당 시간의 정각(00분)부터 가능
            //     current30MinStart.setMinutes(0, 0, 0);
            // } else {
            //     // 30~59분: 해당 시간의 30분부터 가능
            //     current30MinStart.setMinutes(30, 0, 0);
            // }

            // if (startDate < current30MinStart) {
            //     return {
            //         isAllowed: false,
            //         reason: '현재 30분 단위 시간대 이전으로는 일정을 생성할 수 없습니다.',
            //         reasonCode: 'PAST_30MIN_SLOT_NOT_ALLOWED',
            //     };
            // }

            // 시작/종료 시간 유효성 체크
            if (startDate >= endDate) {
                return {
                    isAllowed: false,
                    reason: '시작 시간은 종료 시간보다 빨라야 합니다.',
                    reasonCode: 'INVALID_TIME_RANGE',
                };
            }
        }

        // 3. 자원 예약 정책 체크는 비즈니스 레이어에서 처리 (레거시 로직 유지)
        // 레거시에서는 각 날짜별로 자원 가용성을 체크하며, 실패한 일정은 failedSchedules에 포함

        return { isAllowed: true };
    }

    /**
     * 정책 체크 실패 시 예외를 던집니다
     */
    /**
     * 일정 30분 연장 가능 여부를 판단합니다
     * 1. 자원예약이 포함된 일정인지 확인
     * 2. 현재 시간이 일정 종료 15분 전부터 일정 종료시간 사이인지 확인
     * 3. 30분 연장 시 충돌하는 예약이 있는지 확인
     */
    async 일정_30분_연장이_가능한지_확인한다(schedule: Schedule, reservation?: Reservation): Promise<PolicyResult> {
        // 1. 자원예약이 포함된 일정인지 확인
        if (!reservation) {
            return {
                isAllowed: false,
                reason: '자원예약이 포함된 일정만 연장할 수 있습니다.',
                reasonCode: 'NO_RESOURCE_RESERVATION',
            };
        }

        // 2. 예약 상태 확인 (활성 상태인지)
        if (schedule.status !== ScheduleStatus.PROCESSING && reservation.status !== ReservationStatus.USING) {
            return {
                isAllowed: false,
                reason: '활성 상태인 예약만 연장할 수 있습니다.',
                reasonCode: 'RESERVATION_INACTIVE',
            };
        }

        // 3. 현재 시간이 연장 가능 시간 범위에 있는지 확인 (일정 종료 15분 전부터 일정 종료시간 사이)
        // const currentTime = new Date();
        // const extendableStartTime = new Date(schedule.endDate);
        // extendableStartTime.setMinutes(extendableStartTime.getMinutes() - 15);

        // if (currentTime < extendableStartTime || currentTime > schedule.endDate) {
        //     return {
        //         isAllowed: false,
        //         reason: '일정 종료 15분 전부터 종료시간까지만 연장할 수 있습니다.',
        //         reasonCode: 'INVALID_EXTEND_TIME',
        //     };
        // }

        // 4. 30분 연장 시 충돌하는 예약이 있는지 확인
        const extendedEndTime = new Date(schedule.endDate);
        extendedEndTime.setMinutes(extendedEndTime.getMinutes() + 30);

        try {
            const isAvailable = await this.domainReservationService.checkReservationConflicts(
                reservation.resourceId,
                schedule.endDate,
                extendedEndTime,
                reservation.reservationId,
            );

            if (!isAvailable) {
                return {
                    isAllowed: false,
                    reason: '연장하려는 시간에 다른 예약이 있습니다.',
                    reasonCode: 'RESERVATION_CONFLICT',
                };
            }
        } catch (error) {
            return {
                isAllowed: false,
                reason: '예약 충돌 확인 중 오류가 발생했습니다.',
                reasonCode: 'CONFLICT_CHECK_ERROR',
            };
        }

        return {
            isAllowed: true,
            reason: '일정 연장이 가능합니다.',
        };
    }

    정책_체크_실패시_예외를_던진다(policyResult: PolicyResult): void {
        if (!policyResult.isAllowed) {
            throw new BadRequestException({
                message: policyResult.reason || '정책 위반',
                code: policyResult.reasonCode || 'POLICY_VIOLATION',
            });
        }
    }

    /**
     * 일정 날짜 수정이 가능한지 확인한다
     */
    async 일정_날짜수정이_가능한지_확인한다(
        schedule: Schedule,
        reservation: Reservation,
        dateChanges: { newStartDate?: Date; newEndDate?: Date },
    ): Promise<PolicyResult> {
        // 1. 일정 상태 확인 (완료/취소된 일정은 수정 불가)
        if (schedule.status === ScheduleStatus.COMPLETED || schedule.status === ScheduleStatus.CANCELLED) {
            return {
                isAllowed: false,
                reason: '완료되거나 취소된 일정은 수정할 수 없습니다.',
                reasonCode: 'SCHEDULE_STATUS_NOT_MODIFIABLE',
            };
        }

        // 3. 날짜 범위 검증
        const newStartDate = dateChanges.newStartDate || schedule.startDate;
        const newEndDate = dateChanges.newEndDate || schedule.endDate;

        if (newStartDate >= newEndDate) {
            return {
                isAllowed: false,
                reason: '시작 시간이 종료 시간보다 늦을 수 없습니다.',
                reasonCode: 'INVALID_DATE_RANGE',
            };
        }

        // 4. 예약 충돌 확인 (reservation이 있는 경우)
        if (reservation) {
            const isAvailable = await this.domainReservationService.checkReservationConflicts(
                reservation.resourceId,
                newStartDate,
                newEndDate,
                reservation.reservationId,
            );

            if (!isAvailable) {
                return {
                    isAllowed: false,
                    reason: '해당 시간대에 다른 예약이 있습니다.',
                    reasonCode: 'RESERVATION_CONFLICT',
                };
            }
        }

        return { isAllowed: true, reason: '일정 날짜 수정이 가능합니다.' };
    }

    /**
     * 일정 정보 수정이 가능한지 확인한다
     */
    async 일정_정보수정이_가능한지_확인한다(schedule: Schedule, infoChanges: any): Promise<PolicyResult> {
        // 정보 수정은 일반적으로 제약이 적음
        // 필요한 경우에만 특별한 검증 로직 추가

        // 예: 참여자 수 제한
        // if (infoChanges.participants && infoChanges.participants.length > 50) {
        //     return {
        //         isAllowed: false,
        //         reason: '참여자는 최대 50명까지 가능합니다.',
        //         reasonCode: 'TOO_MANY_PARTICIPANTS',
        //     };
        // }

        return { isAllowed: true, reason: '일정 정보 수정이 가능합니다.' };
    }

    /**
     * 일정 자원 수정이 가능한지 확인한다
     */
    async 일정_자원수정이_가능한지_확인한다(
        schedule: Schedule,
        reservation: Reservation,
        newResourceId: string,
    ): Promise<PolicyResult> {
        // 1. 일정 상태 확인
        if (schedule.status === ScheduleStatus.COMPLETED || schedule.status === ScheduleStatus.CANCELLED) {
            return {
                isAllowed: false,
                reason: '완료되거나 취소된 일정은 수정할 수 없습니다.',
                reasonCode: 'SCHEDULE_STATUS_NOT_MODIFIABLE',
            };
        }

        // 2. 새 자원의 예약 가능성 확인 (기존 시간대 기준)
        if (reservation) {
            const isAvailable = await this.domainReservationService.checkReservationConflicts(
                newResourceId,
                schedule.startDate,
                schedule.endDate,
                reservation.reservationId,
            );

            if (!isAvailable) {
                return {
                    isAllowed: false,
                    reason: '새로운 자원의 해당 시간대에 다른 예약이 있습니다.',
                    reasonCode: 'NEW_RESOURCE_CONFLICT',
                };
            }
        }

        return { isAllowed: true, reason: '일정 자원 수정이 가능합니다.' };
    }

    /**
     * 수정 시나리오 분석
     */
    수정_시나리오를_분석한다(updateDto: any): UpdateScenarios {
        return {
            isDateUpdate: !!(updateDto.date?.startDate || updateDto.date?.endDate),
            isInfoUpdate: !!(
                updateDto.info?.title ||
                updateDto.info?.description ||
                updateDto.info?.notifyBeforeStart !== undefined ||
                updateDto.info?.notifyMinutesBeforeStart ||
                updateDto.info?.location ||
                updateDto.info?.scheduleType ||
                updateDto.info?.projectId ||
                updateDto.info?.participants ||
                updateDto.info?.departmentIds
            ),
            isResourceUpdate: !!updateDto.resource?.resourceId,
        };
    }

    /**
     * 수정 요청 기본 검증
     */
    수정요청을_기본검증한다(updateDto: any, scenarios: UpdateScenarios): void {
        // 1. 최소 하나의 수정 항목은 있어야 함
        if (!scenarios.isDateUpdate && !scenarios.isInfoUpdate && !scenarios.isResourceUpdate) {
            throw new BadRequestException('수정할 항목이 없습니다.');
        }

        // 2. 하나의 시나리오만 실행되어야 함
        // const activeScenarios = [scenarios.isDateUpdate, scenarios.isInfoUpdate, scenarios.isResourceUpdate].filter(
        //     Boolean,
        // );
        // if (activeScenarios.length > 1) {
        //     throw new BadRequestException('한 번에 하나의 수정 유형만 가능합니다.');
        // }

        // 3. 필수 값 검증
        if (scenarios.isDateUpdate) {
            if (!updateDto.date?.startDate || !updateDto.date?.endDate) {
                throw new BadRequestException('날짜 수정 시 시작일과 종료일이 모두 필요합니다.');
            }
        }

        if (scenarios.isResourceUpdate) {
            if (!updateDto.resource?.resourceId) {
                throw new BadRequestException('자원 수정 시 자원 ID가 필요합니다.');
            }
        }
    }
}
