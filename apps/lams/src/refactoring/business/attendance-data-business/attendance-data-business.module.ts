import { Module } from '@nestjs/common';
import { AttendanceDataBusinessService } from './attendance-data-business.service';
import { AttendanceDataContextModule } from '../../context/attendance-data-context/attendance-data-context.module';
import { DataSnapshotContextModule } from '../../context/data-snapshot-context/data-snapshot-context.module';

/**
 * 출입/근태 데이터 비즈니스 Module
 */
@Module({
    imports: [AttendanceDataContextModule, DataSnapshotContextModule],
    providers: [AttendanceDataBusinessService],
    exports: [AttendanceDataBusinessService],
})
export class AttendanceDataBusinessModule {}
