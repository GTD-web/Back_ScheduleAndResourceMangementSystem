import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventInfo } from './event-info.entity';
import { DomainEventInfoService } from './event-info.service';

/**
 * 이벤트 정보 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([EventInfo])],
    providers: [DomainEventInfoService],
    exports: [DomainEventInfoService, TypeOrmModule],
})
export class DomainEventInfoModule {}

