import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsBusinessModule } from '../../business/settings-business/settings-business.module';

/**
 * 설정 관리 Interface 모듈
 */
@Module({
    imports: [SettingsBusinessModule],
    controllers: [SettingsController],
})
export class SettingsInterfaceModule {}
