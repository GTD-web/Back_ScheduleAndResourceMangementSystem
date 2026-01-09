import { Module } from '@nestjs/common';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { AttendanceTypeContextModule } from '../../context/attendance-type';
import { HolidayInfoContextModule } from '../../context/holiday-info';
import { DepartmentContextModule } from '../../context/department';

@Module({
    imports: [AttendanceTypeContextModule, HolidayInfoContextModule, DepartmentContextModule],
    controllers: [MetadataController],
    providers: [MetadataService],
    exports: [MetadataService],
})
export class MetadataModule {}

