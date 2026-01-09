// node_modules
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import {
    EmployeeReservationStats,
    ResourceUsageStats,
    VehicleMaintenanceHistory,
    ConsumableMaintenanceStats,
} from '../../../libs/entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EmployeeReservationStats,
            ResourceUsageStats,
            VehicleMaintenanceHistory,
            ConsumableMaintenanceStats,
        ]),
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService],
})
export class StatisticsModule {}
