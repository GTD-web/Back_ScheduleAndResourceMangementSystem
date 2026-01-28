import { Module } from '@nestjs/common';
import { WorkHoursBusinessService } from './work-hours-business.service';
import { WorkHoursContextModule } from '../../context/work-hours-context/work-hours-context.module';
import { SettingsContextModule } from '../../context/settings-context/settings-context.module';

/**
 * 시수 비즈니스 모듈
 */
@Module({
    imports: [WorkHoursContextModule, SettingsContextModule],
    providers: [WorkHoursBusinessService],
    exports: [WorkHoursBusinessService],
})
export class WorkHoursBusinessModule {}
