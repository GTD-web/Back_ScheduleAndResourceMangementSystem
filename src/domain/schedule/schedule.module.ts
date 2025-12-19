import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainScheduleService } from './schedule.service';
import { DomainScheduleRepository } from './schedule.repository';
import { Schedule } from '../../../libs/entities/schedule.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Schedule])],
    providers: [DomainScheduleService, DomainScheduleRepository],
    exports: [DomainScheduleService],
})
export class DomainScheduleModule {}
