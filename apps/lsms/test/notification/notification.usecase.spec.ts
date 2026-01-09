import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { NotificationUsecase } from '@resource/modules/notification/application/usecases/notification.usecase';
import { NotificationService } from '@resource/modules/notification/application/services/notification.service';
import { AdapterService } from '@resource/modules/notification/application/services/adapter.service';
import { UserService } from '@resource/modules/auth/application/services/user.service';
import { User, Notification, EmployeeNotification, Employee } from '@libs/entities';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NotificationType } from '@libs/enums/notification-type.enum';
import { ResourceType } from '@libs/enums/resource-type.enum';
import { EmployeeNotificationService } from '@resource/modules/notification/application/services/employee-notification.service';
import { ResponseNotificationDto } from '@resource/modules/notification/application/dto/response-notification.dto';
import { v4 as uuidv4 } from 'uuid';
import { getTestDbConfig, closeTestContainer } from '../test-db.config';
import { NotificationRepository } from '@resource/modules/notification/infrastructure/adapters/out/persistence/notification.repository';
import { EmployeeNotificationRepository } from '@resource/modules/notification/infrastructure/adapters/out/persistence/employee-notification.repository';
import { UserRepository } from '@resource/modules/auth/infrastructure/adapters/out/user.repository';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// PushNotificationPort 인터페이스 구현한 mock 어댑터
import {
    PushNotificationPort,
    PushNotificationSubscription,
    PushNotificationPayload,
    PushNotificationSendResult,
} from '@resource/modules/notification/domain/ports/push-notification.port';

// 시간 초과 설정 - 다른 테스트와 동일하게 30초로 설정
jest.setTimeout(30000);

class MockPushNotificationAdapter implements PushNotificationPort {
    private notifications: Array<{ subscription: PushNotificationSubscription; payload: PushNotificationPayload }> = [];

    async sendNotification(
        subscription: PushNotificationSubscription,
        payload: PushNotificationPayload,
    ): Promise<PushNotificationSendResult> {
        this.notifications.push({
            subscription,
            payload,
        });

        return {
            success: true,
            message: 'success',
            error: null,
        };
    }

    getNotifications() {
        return this.notifications;
    }

    clearNotifications() {
        this.notifications = [];
    }
}

describe('NotificationUsecase Integration Test', () => {
    let moduleRef: TestingModule;
    let notificationUsecase: NotificationUsecase;
    let notificationService: NotificationService;
    let employeeNotificationService: EmployeeNotificationService;
    let adapterService: AdapterService;
    let userService: UserService;
    let mockPushNotification: MockPushNotificationAdapter;
    let dataSource: DataSource;
    let schedulerRegistry: SchedulerRegistry;
    const TEST_ID = 'notification-usecase-test';

    // 테스트에 사용할 직원 ID (테스트 실행 시 DB에서 가져올 예정)
    let TEST_EMPLOYEE_ID: string;

    beforeAll(async () => {
        // DB 연결 설정
        const dbConfig = await getTestDbConfig(TEST_ID);
        mockPushNotification = new MockPushNotificationAdapter();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                }),
                TypeOrmModule.forRoot({
                    ...dbConfig,
                    autoLoadEntities: true,
                }),
                TypeOrmModule.forFeature([Notification, EmployeeNotification, User, Employee]),
            ],
            providers: [
                NotificationUsecase,
                NotificationService,
                EmployeeNotificationService,
                AdapterService,
                UserService,
                ConfigService,
                SchedulerRegistry,
                {
                    provide: 'NotificationRepositoryPort',
                    useClass: NotificationRepository,
                },
                {
                    provide: 'EmployeeNotificationRepositoryPort',
                    useClass: EmployeeNotificationRepository,
                },
                {
                    provide: 'PushNotificationServicePort',
                    useValue: mockPushNotification,
                },
                {
                    provide: 'UserRepositoryPort',
                    useClass: UserRepository,
                },
            ],
        }).compile();

        notificationUsecase = moduleRef.get<NotificationUsecase>(NotificationUsecase);
        notificationService = moduleRef.get<NotificationService>(NotificationService);
        employeeNotificationService = moduleRef.get<EmployeeNotificationService>(EmployeeNotificationService);
        adapterService = moduleRef.get<AdapterService>(AdapterService);
        userService = moduleRef.get<UserService>(UserService);
        dataSource = moduleRef.get<DataSource>(DataSource);
        schedulerRegistry = moduleRef.get<SchedulerRegistry>(SchedulerRegistry);

        // 실제 DB에서 첫 번째 직원 ID 가져오기
        const result = await userService.findAll();

        if (result && result.length > 0) {
            TEST_EMPLOYEE_ID = result[0].employeeId;
            console.log(`Using employee ID from DB: ${TEST_EMPLOYEE_ID}`);
        } else {
            throw new Error('No employees found in database. Cannot run tests.');
        }
    });

    afterAll(async () => {
        await moduleRef.close();
        await closeTestContainer(TEST_ID);
    });

    beforeEach(() => {
        mockPushNotification.clearNotifications();
    });

    describe('createNotification', () => {
        it('should create and send notification', async () => {
            // 1. 알림 데이터 준비
            const notificationType = NotificationType.RESERVATION_STATUS_CONFIRMED;
            const notificationData = {
                resourceName: '회의실 B',
                resourceType: ResourceType.MEETING_ROOM,
                resourceId: uuidv4(),
                reservationTitle: '중요 회의',
                reservationDate: new Date().toISOString(),
            };

            // 2. 알림 생성
            await notificationUsecase.createNotification(notificationType, notificationData, [TEST_EMPLOYEE_ID]);

            // 3. 알림 저장 확인
            const notifications = await notificationService.findAll({
                where: { notificationType },
                order: { createdAt: 'DESC' },
                take: 1,
            });

            expect(notifications).toBeDefined();
            expect(notifications.length).toBe(1);

            // 4. 직원-알림 연결 확인
            const employeeNotifications = await employeeNotificationService.findAll({
                where: { notificationId: notifications[0].notificationId },
            });

            expect(employeeNotifications).toBeDefined();
            expect(employeeNotifications.length).toBeGreaterThanOrEqual(1);

            // employeeId가 같은지 확인
            const hasMatchingEmployee = employeeNotifications.some((en) => en.employeeId === TEST_EMPLOYEE_ID);
            expect(hasMatchingEmployee).toBe(true);

            // 5. 알림 발송 확인
            const sentNotifications = mockPushNotification.getNotifications();
            expect(sentNotifications.length).toBeGreaterThanOrEqual(0);
        });
    });

    // 실제 DB의 사용자를 이용한 테스트
    describe('findMyNotifications', () => {
        it('should return user notifications', async () => {
            // 1. 알림 생성
            const notification = await notificationService.save({
                title: '알림 테스트',
                body: '알림 내용 테스트',
                notificationType: NotificationType.RESERVATION_STATUS_CONFIRMED,
                notificationData: {
                    resourceName: '회의실 A',
                    resourceType: ResourceType.MEETING_ROOM,
                    resourceId: uuidv4(),
                },
                createdAt: new Date().toISOString(),
                isSent: true,
            });

            // 2. 직원-알림 연결 생성
            await employeeNotificationService.save({
                notificationId: notification.notificationId,
                employeeId: TEST_EMPLOYEE_ID,
            });

            // 3. 알림 조회
            const result = await notificationUsecase.findMyNotifications(TEST_EMPLOYEE_ID);

            // 4. 검증
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThanOrEqual(1);

            // 가장 최근 알림 검증
            const latestNotification = result[0];
            expect(latestNotification).toHaveProperty('title');
            expect(latestNotification).toHaveProperty('body');
        });
    });

    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            // 1. 알림 생성
            const notification = await notificationService.save({
                title: '읽음 표시 테스트',
                body: '읽음 표시 테스트 내용',
                notificationType: NotificationType.RESERVATION_STATUS_CONFIRMED,
                notificationData: {
                    resourceName: '회의실 C',
                    resourceType: ResourceType.MEETING_ROOM,
                    resourceId: uuidv4(),
                },
                createdAt: new Date().toISOString(),
                isSent: true,
            });

            // 2. 직원-알림 연결 생성 (기본적으로 isRead는 false로 설정됨)
            await employeeNotificationService.save({
                notificationId: notification.notificationId,
                employeeId: TEST_EMPLOYEE_ID,
            });

            // 3. 읽음 표시
            await notificationUsecase.markAsRead(TEST_EMPLOYEE_ID, notification.notificationId);

            // 4. 읽음 표시 확인
            const employeeNotification = await employeeNotificationService.findOne({
                where: {
                    notificationId: notification.notificationId,
                    employeeId: TEST_EMPLOYEE_ID,
                },
            });

            expect(employeeNotification).toBeDefined();
            expect(employeeNotification.isRead).toBe(true);
        });
    });

    describe('subscription', () => {
        it('should subscribe to notifications with FCM', async () => {
            // 1. 구독 정보 생성
            const subscription: PushNotificationSubscription = {
                fcm: {
                    token: 'test-fcm-token',
                },
                webPush: null,
            };

            const user = await dataSource.getRepository(User).findOne({
                where: { employeeId: TEST_EMPLOYEE_ID },
            });

            // 2. 구독 요청
            await notificationUsecase.subscribe(user, subscription);

            // 3. 구독 결과 확인
            const result = await dataSource.getRepository(User).findOne({
                where: { employeeId: TEST_EMPLOYEE_ID },
            });

            expect(result).toBeDefined();
            expect(result.subscription).toEqual(subscription);
        });

        it('should subscribe to notifications with WebPush', async () => {
            // 1. 구독 정보 생성
            const subscription: PushNotificationSubscription = {
                fcm: null,
                webPush: {
                    endpoint: 'https://test-endpoint.com',
                    keys: {
                        auth: 'test-auth-key',
                        p256dh: 'test-p256dh-key',
                    },
                },
            };

            const user = await dataSource.getRepository(User).findOne({
                where: { employeeId: TEST_EMPLOYEE_ID },
                relations: ['employee'],
            });
            // 2. 구독 요청
            await notificationUsecase.subscribe(user, subscription);

            // 3. 구독 결과 확인
            const result = await dataSource.getRepository(User).findOne({
                where: { employeeId: TEST_EMPLOYEE_ID },
            });

            expect(result).toBeDefined();
            expect(result.subscription).toEqual(subscription);
        });

        it('should unsubscribe from notifications', async () => {
            // 1. 먼저 구독
            const subscription: PushNotificationSubscription = {
                fcm: {
                    token: 'test-fcm-token',
                },
                webPush: null,
            };
            const user = await dataSource.getRepository(User).findOne({
                where: { employeeId: TEST_EMPLOYEE_ID },
            });

            await notificationUsecase.subscribe(user, subscription);

            // 2. 구독 해제 요청
            await notificationUsecase.unsubscribe(user);

            // 3. 구독 해제 결과 확인
            const result = await dataSource.getRepository(User).findOne({
                where: { employeeId: TEST_EMPLOYEE_ID },
            });

            expect(result).toBeDefined();
            expect(result.subscription).toBeNull();
        });
    });
});
