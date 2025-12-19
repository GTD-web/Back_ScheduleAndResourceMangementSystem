import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainFileMaintenanceService } from './file-maintenance.service';
import { DomainFileMaintenanceRepository } from './file-maintenance.repository';
import { FileMaintenance } from '../../../libs/entities/file-maintenance.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FileMaintenance])],
    providers: [DomainFileMaintenanceService, DomainFileMaintenanceRepository],
    exports: [DomainFileMaintenanceService],
})
export class DomainFileMaintenanceModule {}
