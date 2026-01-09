import { Injectable } from '@nestjs/common';
import { SchedulePostProcessingService } from '../../../context/schedule/services/schedule-post-processing.service';
import { ReservationContextService } from '../../../context/reservation/services/reservation.context.service';

@Injectable()
export class CronReservationService {
    constructor(
        private readonly reservationContextService: ReservationContextService,
        private readonly schedulePostProcessingService: SchedulePostProcessingService,
    ) {}

    // ==================== 크론 작업 처리 ====================
    async closeReservation(): Promise<void> {
        await this.schedulePostProcessingService.일정관련_배치_작업을_처리한다();
        return this.reservationContextService.예약관련_배치_작업을_처리한다();
    }

    async handleStartOdometer(): Promise<void> {
        return this.reservationContextService.시작주행거리를_처리한다();
    }
}
