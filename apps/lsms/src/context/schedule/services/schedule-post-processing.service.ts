import { Injectable, Logger } from '@nestjs/common';
import { DomainScheduleService } from '../../../domain/schedule/schedule.service';
import { ScheduleStatus } from '../../../../libs/enums/schedule-type.enum';
import { DomainReservationService } from '../../../domain/reservation/reservation.service';

@Injectable()
export class SchedulePostProcessingService {
    private readonly logger = new Logger(SchedulePostProcessingService.name);

    constructor(
        private readonly domainScheduleService: DomainScheduleService,
        private readonly domainReservationService: DomainReservationService,
    ) {
        // private readonly scheduleNotificationContextService: ScheduleNotificationContextService, // private readonly employeeContextService: EmployeeContextService, // private readonly scheduleQueryContextService: ScheduleQueryContextService,
    }

    async 일정관련_배치_작업을_처리한다(): Promise<void> {
        // PENDING = 'PENDING', // 대기
        // PROCESSING = 'PROCESSING', // 진행중
        // COMPLETED = 'COMPLETED', // 완료
        // CANCELLED = 'CANCELLED', // 취소

        // 대기 -> 진행중 (시작시간이 되었을 때)
        // 자원예약이 있는 경우이면서 숙소예약이라면 관리자 승인이 진행되어야 자원예약상태가 변경됨
        // 일정상태는 진행중으로 변경
        const pendingToChangeProcessing = await this.domainScheduleService.findByPendingToChangeProcessing();
        for (const schedule of pendingToChangeProcessing) {
            await this.domainScheduleService.update(schedule.scheduleId, { status: ScheduleStatus.PROCESSING });
        }

        // 진행중 -> 완료 (종료시간이 되었을 때)
        // 자원예약이 있는 경우이면서 차량예약이라면 차량이 반납 되어야 지원예약상태가 변경됨
        // 일정상태는 진행중으로 변경
        const processingToChangeCompleted = await this.domainScheduleService.findByProcessingToChangeCompleted();
        for (const schedule of processingToChangeCompleted) {
            await this.domainScheduleService.update(schedule.scheduleId, { status: ScheduleStatus.COMPLETED });
        }
    }
}
