import { Module } from '@nestjs/common';
import { FileManagementInterfaceModule } from './file-management/file-management-interface.module';
import { AuthInterfaceModule } from './auth/auth-interface.module';

/**
 * 인터페이스 모듈
 *
 * 모든 API 인터페이스 모듈들을 통합 관리합니다.
 */
@Module({
    imports: [FileManagementInterfaceModule, AuthInterfaceModule],
    controllers: [],
    providers: [],
    exports: [],
})
export class InterfaceModule {}
