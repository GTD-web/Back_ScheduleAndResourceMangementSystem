import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee, EmployeeNotification, Notification, Reservation, NotificationTypeEntity } from '../../../libs/entities';
import { DomainNotificationModule } from '../../domain/notification/notification.module';
import { DomainNotificationTypeModule } from '../../domain/notification-type/notification-type.module';
import { DomainEmployeeNotificationModule } from '../../domain/employee-notification/employee-notification.module';
import { NotificationContextService } from './services/notification.context.service';
import { DomainEmployeeModule } from '../../domain/employee/employee.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { FIREBASE_CONFIG } from '../../../libs/configs/env.config';
import { DomainReservationModule } from '../../domain/reservation/reservation.module';
import { FCMAdapter } from './adapter/fcm-push.adapter';
import { ScheduleNotificationContextService } from './services/schedule-notification.context.service';
import { ReservationNotificationContextService } from './services/reservation-notification.context.service';
import { ResourceNotificationContextService } from './services/resource-notification.context.service';
import { FCMMicroserviceAdapter } from './adapter/fcm.adapter';
import { HttpModule } from '@nestjs/axios';

/**
 * 알림 컨텍스트 모듈
 *
 * 알림 관련 컨텍스트 로직을 처리하는 모듈입니다:
 * - 알림 생성/전송/조회/읽음 처리 로직
 * - FCM 푸시 알림 처리
 * - 크론 작업을 통한 예약 알림 전송
 * - Domain layer만 의존 (MDC 규칙 준수)
 *
 * 특징:
 * - 컨트롤러는 Business layer로 이전됨
 * - Context 서비스들만 제공
 * - FCM 어댑터를 통한 외부 서비스 연동
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([Employee, Notification, EmployeeNotification, Reservation, NotificationTypeEntity]),
        ConfigModule.forFeature(FIREBASE_CONFIG),
        ScheduleModule.forRoot(),
        HttpModule,
        DomainEmployeeModule,
        DomainEmployeeNotificationModule,
        DomainNotificationModule,
        DomainNotificationTypeModule,
        DomainReservationModule,
    ],
    controllers: [], // 컨트롤러들은 Business layer로 이전됨
    providers: [
        NotificationContextService,
        ScheduleNotificationContextService,
        ReservationNotificationContextService,
        ResourceNotificationContextService,
        FCMAdapter,
        FCMMicroserviceAdapter,
    ],
    exports: [
        NotificationContextService,
        ScheduleNotificationContextService,
        ReservationNotificationContextService,
        ResourceNotificationContextService,
        FCMAdapter,
        FCMMicroserviceAdapter,
    ],
})
export class NotificationContextModule {}
