import { Module } from '@nestjs/common';
import { FileManagementBusinessService } from './file-management-business.service';
import { FileManagementContextModule } from '../../context/file-management-context/file-management-context.module';
import { AttendanceDataContextModule } from '../../context/attendance-data-context/attendance-data-context.module';

/**
 * 파일관리 비즈니스 모듈
 *
 * 파일관리 관련 비즈니스 로직을 제공합니다.
 */
@Module({
    imports: [FileManagementContextModule.forRoot(), AttendanceDataContextModule],
    providers: [FileManagementBusinessService],
    exports: [FileManagementBusinessService],
})
export class FileManagementBusinessModule {}
