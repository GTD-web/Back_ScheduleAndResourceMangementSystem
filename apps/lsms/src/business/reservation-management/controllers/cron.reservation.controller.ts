import { Public } from '../../../../libs/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { CronReservationService } from '../services/cron-reservation.service';

@ApiTags('v2 예약 ')
@Public()
@Controller('v1/reservations')
export class CronReservationController {
    constructor(private readonly cronReservationService: CronReservationService) {}

    @ApiExcludeEndpoint()
    @Get('cron-job/close')
    async closeReservation() {
        return this.cronReservationService.closeReservation();
    }

    @ApiExcludeEndpoint()
    @Get('cron-job/start-odometer')
    async handleStartOdometer() {
        return this.cronReservationService.handleStartOdometer();
    }
}
