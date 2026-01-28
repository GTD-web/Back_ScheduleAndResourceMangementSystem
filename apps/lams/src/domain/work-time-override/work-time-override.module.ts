import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkTimeOverride } from './work-time-override.entity';
import { DomainWorkTimeOverrideService } from './work-time-override.service';

/**
 * 근무시간 커스터마이징 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([WorkTimeOverride])],
    providers: [DomainWorkTimeOverrideService],
    exports: [DomainWorkTimeOverrideService, TypeOrmModule],
})
export class DomainWorkTimeOverrideModule {}
