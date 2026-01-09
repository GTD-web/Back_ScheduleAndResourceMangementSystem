import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEventInfoService } from './event-info.service';
import { DomainEventInfoRepository } from './event-info.repository';
import { EventInfo } from './event-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EventInfo])],
    providers: [DomainEventInfoService, DomainEventInfoRepository],
    exports: [DomainEventInfoService],
})
export class DomainEventInfoModule {}

