import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainScheduleParticipantService } from './schedule-participant.service';
import { DomainScheduleParticipantRepository } from './schedule-participant.repository';
import { ScheduleParticipant } from './schedule-participant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ScheduleParticipant])],
    providers: [DomainScheduleParticipantService, DomainScheduleParticipantRepository],
    exports: [DomainScheduleParticipantService],
})
export class DomainScheduleParticipantModule {}
