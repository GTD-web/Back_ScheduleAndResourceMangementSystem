import { Module } from '@nestjs/common';
import { AttendanceDataController } from './attendance-data.controller';
import { AttendanceDataBusinessModule } from '../../business/attendance-data-business/attendance-data-business.module';

/**
 * 출입/근태 데이터 인터페이스 모듈
 *
 * 출입/근태 데이터 관련 API 엔드포인트를 제공합니다.
 * - 월간 요약 조회
 */
@Module({
    imports: [AttendanceDataBusinessModule],
    controllers: [AttendanceDataController],
    providers: [],
    exports: [],
})
export class AttendanceDataInterfaceModule {}
