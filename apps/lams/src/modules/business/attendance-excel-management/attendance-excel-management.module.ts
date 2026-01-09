import { Module } from '@nestjs/common';
import { AttendanceExcelManagementController } from './attendance-excel-management.controller';
import { AttendanceExcelManagementService } from './attendance-excel-management.service';
import { AttendanceDataModule } from '../../context/attendance-data';
import { MonthlySummaryContextModule } from '../../context/monthly-summary/monthly-summary.context.module';

@Module({
    imports: [AttendanceDataModule, MonthlySummaryContextModule],
    controllers: [AttendanceExcelManagementController],
    providers: [AttendanceExcelManagementService],
    exports: [AttendanceExcelManagementService],
})
export class AttendanceExcelManagementModule {}
