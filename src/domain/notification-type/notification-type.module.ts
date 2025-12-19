import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTypeEntity } from '../../../libs/entities/notification-type.entity';
import { DomainNotificationTypeService } from './notification-type.service';

/**
 * 알림 타입 도메인 모듈
 *
 * NotificationTypeEntity에 대한 도메인 로직을 처리하는 모듈입니다.
 * - 알림 타입별 설정 관리
 * - 템플릿 및 요구사항 정보 제공
 * - 순수한 데이터 액세스 레이어
 *
 * 특징:
 * - 엔티티와 Repository만 의존
 * - 비즈니스 로직 없는 순수 CRUD
 * - Context/Business layer에서 사용
 */
@Module({
    imports: [TypeOrmModule.forFeature([NotificationTypeEntity])],
    providers: [DomainNotificationTypeService],
    exports: [DomainNotificationTypeService],
})
export class DomainNotificationTypeModule {}
