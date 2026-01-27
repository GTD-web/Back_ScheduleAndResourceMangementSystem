import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkScheduleType } from './work-schedule-type.entity';
import { DomainWorkScheduleTypeService } from './work-schedule-type.service';

/**
 * 근무 유형 모듈
 *
 * 직원의 고정근무/유연근무 상태를 기간별로 관리하는 도메인 모듈입니다.
 */
@Module({
    imports: [TypeOrmModule.forFeature([WorkScheduleType])],
    providers: [DomainWorkScheduleTypeService],
    exports: [DomainWorkScheduleTypeService, TypeOrmModule],
})
export class WorkScheduleTypeModule {}
