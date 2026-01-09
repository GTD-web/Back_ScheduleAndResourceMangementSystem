import { Entity, PrimaryColumn, Column } from 'typeorm';
import { NotificationType } from '../../../libs/enums/notification-type.enum';

/**
 * 알림 타입별 필수 정보 정의 인터페이스
 * 계층적 구조로 각 단계별 필요성을 체크합니다.
 */
export interface NotificationTypeRequirements {
    /** 일정 정보 관련 요구사항 */
    schedule?: {
        /** 일정 객체 전체 필요 여부 */
        required: boolean;
    };

    /** 예약 정보 관련 요구사항 */
    reservation?: {
        /** 예약 객체 전체 필요 여부 */
        required: boolean;
    };

    /** 자원 정보 관련 요구사항 */
    resource?: {
        /** 자원 객체 전체 필요 여부 */
        required: boolean;
        /** 차량 정보 중첩 요구사항 (resource.vehicleInfo) */
        vehicleInfo?: {
            /** 차량 정보 객체 필요 여부 */
            required: boolean;
            /** 소모품 정보 중첩 요구사항 (resource.vehicleInfo.consumable) */
            consumable?: {
                /** 소모품 정보 객체 필요 여부 */
                required: boolean;
            };
        };
    };

    /** 프로젝트 정보 관련 요구사항 */
    project?: {
        /** 프로젝트 객체 전체 필요 여부 */
        required: boolean;
    };
}

/**
 * 알림 타입 설정 엔티티
 *
 * 각 알림 타입별로 필요한 정보와 설정을 관리합니다.
 * - 어떤 데이터가 필수인지 정의
 * - 기본 알림 템플릿 관리
 * - 알림 발송 조건 설정
 */
@Entity('notification_types')
export class NotificationTypeEntity {
    @PrimaryColumn({
        type: 'enum',
        enum: NotificationType,
        enumName: 'notifications_notificationtype_enum', // 기존 ENUM 타입 재사용
        comment: '알림 타입 (기존 notifications 테이블과 동일한 ENUM 사용)',
    })
    notificationType: NotificationType;

    @Column({
        type: 'jsonb',
        comment: '알림 발송 시 필요한 정보 요구사항',
    })
    requirements: NotificationTypeRequirements;

    @Column({
        comment: '기본 알림 제목 템플릿',
    })
    defaultTitleTemplate: string;

    @Column({
        comment: '기본 알림 내용 템플릿',
    })
    defaultBodyTemplate: string;

    @Column({
        nullable: true,
        comment: '알림 설명',
    })
    description?: string;
}
