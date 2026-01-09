import { Module } from '@nestjs/common';
import { AttendanceTypeContext } from './attendance-type.context';
import { DomainAttendanceTypeModule } from '../../domain/attendance-type/attendance-type.module';

@Module({
    imports: [DomainAttendanceTypeModule],
    providers: [AttendanceTypeContext],
    exports: [AttendanceTypeContext],
})
export class AttendanceTypeContextModule {}
