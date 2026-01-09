import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OrganizationMigrationModule } from '../../integrations/migration/migration.module';

/**
 * 인증 인터페이스 모듈
 *
 * 인증 관련 API 엔드포인트를 제공합니다.
 * - JWT 토큰 생성
 * - JWT 토큰 검증
 * - 조직 데이터 마이그레이션
 *
 * 주의: JwtModule은 AppModule에서 global로 등록되어 있어 여기서는 import하지 않습니다.
 */
@Module({
    imports: [OrganizationMigrationModule],
    controllers: [AuthController],
    providers: [],
    exports: [],
})
export class AuthInterfaceModule {}
