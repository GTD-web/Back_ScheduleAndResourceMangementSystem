import { Module } from '@nestjs/common';
import { FileManagementController } from './file-management.controller';
import { FileManagementBusinessModule } from '../../business/file-management-business/file-management-business.module';

/**
 * 파일 관리 인터페이스 모듈
 *
 * 파일 관리 관련 API 엔드포인트를 제공합니다.
 * - 파일 업로드
 * - 파일 내용 반영
 */
@Module({
    imports: [FileManagementBusinessModule],
    controllers: [FileManagementController],
    providers: [],
    exports: [],
})
export class FileManagementInterfaceModule {}
