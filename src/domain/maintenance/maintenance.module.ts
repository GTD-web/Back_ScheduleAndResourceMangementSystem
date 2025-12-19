import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainMaintenanceService } from './maintenance.service';
import { DomainMaintenanceRepository } from './maintenance.repository';
import { Maintenance } from '../../../libs/entities/maintenance.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Maintenance])],
    providers: [DomainMaintenanceService, DomainMaintenanceRepository],
    exports: [DomainMaintenanceService],
})
export class DomainMaintenanceModule {}
