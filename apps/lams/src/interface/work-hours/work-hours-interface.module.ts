import { Module } from '@nestjs/common';
import { WorkHoursController } from './work-hours.controller';
import { WorkHoursBusinessModule } from '../../business/work-hours-business/work-hours-business.module';

/**
 * 시수 관리 인터페이스 모듈
 *
 * 시수 관련 API 엔드포인트를 제공합니다.
 */
@Module({
    imports: [WorkHoursBusinessModule],
    controllers: [WorkHoursController],
    providers: [],
    exports: [],
})
export class WorkHoursInterfaceModule {}
