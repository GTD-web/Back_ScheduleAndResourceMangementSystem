import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkHours } from './work-hours.entity';
import { DomainWorkHoursService } from './work-hours.service';
import { DomainAssignedProjectModule } from '../assigned-project/assigned-project.module';

/**
 * 시수 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([WorkHours]), DomainAssignedProjectModule],
    providers: [DomainWorkHoursService],
    exports: [DomainWorkHoursService, TypeOrmModule],
})
export class DomainWorkHoursModule {}

