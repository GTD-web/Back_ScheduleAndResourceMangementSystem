import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainScheduleRelationService } from './schedule-relation.service';
import { DomainScheduleRelationRepository } from './schedule-relation.repository';
import { ScheduleRelation } from '../../../libs/entities/schedule-relations.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ScheduleRelation])],
    providers: [DomainScheduleRelationService, DomainScheduleRelationRepository],
    exports: [DomainScheduleRelationService],
})
export class DomainScheduleRelationModule {}
