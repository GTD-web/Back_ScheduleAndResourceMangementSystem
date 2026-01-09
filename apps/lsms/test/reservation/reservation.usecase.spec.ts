import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationUsecase } from '@resource/modules/reservation/application/usecases/reservation.usecase';
import { ReservationService } from '@resource/modules/reservation/application/services/reservation.service';
import { ParticipantService } from '@resource/modules/reservation/application/services/participant.service';
import { NotificationUsecase } from '@resource/modules/notification/application/usecases/notification.usecase';
import { NotificationService } from '@resource/modules/notification/application/services/notification.service';
import { AdapterService } from '@resource/modules/notification/application/services/adapter.service';
import { EmployeeNotificationService } from '@resource/modules/notification/application/services/employee-notification.service';
import {
    Resource,
    ResourceGroup,
    User,
    Employee,
    Reservation,
    ReservationParticipant,
    Notification,
    EmployeeNotification,
    Entities,
} from '@libs/entities';
import { getTestDbConfig, closeTestContainer } from '../test-db.config';
import { ReservationRepository } from '@resource/modules/reservation/infrastructure/adapters/out/persistence/reservation.repository';
import { ReservationParticipantRepository } from '@resource/modules/reservation/infrastructure/adapters/out/persistence/reservation-participant.repository';
import { NotificationRepository } from '@resource/modules/notification/infrastructure/adapters/out/persistence/notification.repository';
import { EmployeeNotificationRepository } from '@resource/modules/notification/infrastructure/adapters/out/persistence/employee-notification.repository';
import { ResourceType } from '@libs/enums/resource-type.enum';
import { DataSource } from 'typeorm';
import { ResourceService } from '@resource/modules/resource/common/application/services/resource.service';
import { ResourceRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource.repository';
import { ResourceGroupService } from '@resource/modules/resource/common/application/services/resource-group.service';
import { ResourceGroupRepository } from '@resource/modules/resource/common/infrastructure/adapters/out/persistence/resource-group.repository';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ReservationStatus, ParticipantsType } from '@libs/enums/reservation-type.enum';
import { DateUtil } from '@libs/utils/date.util';
import { CreateReservationDto } from '@resource/modules/reservation/application/dtos/create-reservation.dto';
import { UpdateReservationStatusDto } from '@resource/modules/reservation/application/dtos/update-reservation.dto';
import { UserService } from '@resource/modules/auth/application/services/user.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { UserRepository } from '@resource/modules/auth/infrastructure/adapters/out/user.repository';
import { UserUsecase } from '@resource/modules/auth/application/usecases/user.usecase';

jest.setTimeout(30000);

describe('ReservationUsecase Integration Test', () => {
    let moduleRef: TestingModule;
    let reservationUsecase: ReservationUsecase;
    let reservationService: ReservationService;
    let participantService: ParticipantService;
    let resourceService: ResourceService;
    let resourceGroupService: ResourceGroupService;
    let dataSource: DataSource;
    const TEST_ID = 'reservation-usecase-test';

    // 테스트에 사용할 직원 ID (테스트 실행 시 DB에서 가져올 예정)
    let TEST_EMPLOYEE_ID: string;
    let TEST_USER: User;

    beforeAll(async () => {
        const dbConfig = await getTestDbConfig(TEST_ID);

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                }),
                TypeOrmModule.forRoot({
                    ...dbConfig,
                    autoLoadEntities: true,
                }),
                TypeOrmModule.forFeature(Entities),
            ],
            providers: [
                ReservationUsecase,
                ReservationService,
                ParticipantService,
                ResourceService,
                ResourceGroupService,
                NotificationUsecase,
                NotificationService,
                AdapterService,
                EmployeeNotificationService,
                UserService,
                SchedulerRegistry,
                {
                    provide: 'ReservationRepositoryPort',
                    useClass: ReservationRepository,
                },
                {
                    provide: 'ReservationParticipantRepositoryPort',
                    useClass: ReservationParticipantRepository,
                },
                {
                    provide: 'ResourceRepositoryPort',
                    useClass: ResourceRepository,
                },
                {
                    provide: 'ResourceGroupRepositoryPort',
                    useClass: ResourceGroupRepository,
                },
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
                    useValue: {
                        sendNotification: jest.fn().mockResolvedValue({
                            success: true,
                            message: 'success',
                            error: null,
                        }),
                    },
                },
                {
                    provide: 'UserRepositoryPort',
                    useClass: UserRepository,
                },
                UserUsecase,
            ],
        }).compile();

        reservationUsecase = moduleRef.get<ReservationUsecase>(ReservationUsecase);
        reservationService = moduleRef.get<ReservationService>(ReservationService);
        participantService = moduleRef.get<ParticipantService>(ParticipantService);
        resourceService = moduleRef.get<ResourceService>(ResourceService);
        resourceGroupService = moduleRef.get<ResourceGroupService>(ResourceGroupService);
        dataSource = moduleRef.get<DataSource>(DataSource);

        // 테스트에 사용할 직원 ID 가져오기
        const employee = await dataSource.getRepository(Employee).findOne({
            where: {},
        });
        TEST_EMPLOYEE_ID = employee.employeeId;

        // 테스트에 사용할 사용자 가져오기
        TEST_USER = await dataSource.getRepository(User).findOne({
            where: { employeeId: TEST_EMPLOYEE_ID },
            relations: ['employee'],
        });
    });

    afterAll(async () => {
        await moduleRef.close();
        await closeTestContainer(TEST_ID);
    });

    beforeEach(async () => {
        await dataSource.query('DELETE FROM reservation_participants');
        await dataSource.query('DELETE FROM reservations');
        await dataSource.query('DELETE FROM resources');
        await dataSource.query('DELETE FROM resource_groups');
    });

    describe('makeReservation', () => {
        it('should create a reservation with participants', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 예약 생성
            const startDate = DateUtil.now().addMinutes(60).format();
            const endDate = DateUtil.now().addMinutes(120).format();

            const createDto = {
                resourceId: resource.resourceId,
                resourceType: ResourceType.MEETING_ROOM,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate,
                endDate: endDate,
                participantIds: [TEST_EMPLOYEE_ID],
                notifyMinutesBeforeStart: [10],
                isAllDay: false,
                notifyBeforeStart: true,
            } as CreateReservationDto;

            const result = await reservationUsecase.makeReservation(TEST_USER, createDto);

            expect(result).toBeDefined();
            expect(result.reservationId).toBeDefined();

            // 4. 예약 확인
            const reservation = await reservationService.findOne({
                where: { reservationId: result.reservationId },
                relations: ['participants'],
            });

            expect(reservation).toBeDefined();
            expect(reservation.title).toBe(createDto.title);
            expect(reservation.participants.length).toBe(2); // 예약자 + 참가자
        });

        it('should throw BadRequestException when start date is after end date', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            const startDate = DateUtil.now().addMinutes(120).format();
            const endDate = DateUtil.now().addMinutes(60).format();

            const createDto = {
                resourceId: resource.resourceId,
                resourceType: ResourceType.MEETING_ROOM,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate,
                endDate: endDate,
                participantIds: [TEST_EMPLOYEE_ID],
                notifyMinutesBeforeStart: [10],
                isAllDay: false,
                notifyBeforeStart: true,
            } as CreateReservationDto;

            await expect(reservationUsecase.makeReservation(TEST_USER, createDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findReservationDetail', () => {
        it('should find reservation detail with relations', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 예약 생성
            const startDate = DateUtil.now().addMinutes(60).format();
            const endDate = DateUtil.now().addMinutes(120).format();

            const reservation = await dataSource.getRepository(Reservation).save({
                resourceId: resource.resourceId,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate,
                endDate: endDate,
                status: ReservationStatus.CONFIRMED,
                isAllDay: false,
                notifyBeforeStart: true,
                notifyMinutesBeforeStart: [10],
                resource: resource,
            });

            await dataSource.getRepository(ReservationParticipant).save({
                reservationId: reservation.reservationId,
                employeeId: TEST_EMPLOYEE_ID,
                isHost: true,
                type: ParticipantsType.RESERVER,
            });

            // 4. 예약 상세 조회
            const result = await reservationUsecase.findReservationDetail(TEST_USER, reservation.reservationId);

            expect(result).toBeDefined();
            expect(result.title).toBe(reservation.title);
            expect(result.resource).toBeDefined();
            expect(result.resource.name).toBe(resource.name);
            expect(result.isMine).toBe(true);
        });

        it('should throw NotFoundException when reservation not found', async () => {
            await expect(
                reservationUsecase.findReservationDetail(TEST_USER, '00000000-0000-0000-0000-000000000000'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findMyReservationList', () => {
        it('should find my reservations with optional filters', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 예약 생성
            const startDate = DateUtil.now().addMinutes(60).format();
            const endDate = DateUtil.now().addMinutes(120).format();

            const reservation = await dataSource.getRepository(Reservation).save({
                resourceId: resource.resourceId,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate,
                endDate: endDate,
                status: ReservationStatus.CONFIRMED,
                isAllDay: false,
                notifyBeforeStart: true,
                notifyMinutesBeforeStart: [10],
                resource: resource,
            });

            await dataSource.getRepository(ReservationParticipant).save({
                reservationId: reservation.reservationId,
                employeeId: TEST_EMPLOYEE_ID,
                isHost: true,
                type: ParticipantsType.RESERVER,
            });
            // 4. 예약 목록 조회
            const result = await reservationUsecase.findMyReservationList(
                TEST_EMPLOYEE_ID,
                DateUtil.format(startDate, 'YYYY-MM-DD'),
                ResourceType.MEETING_ROOM,
            );

            expect(result).toBeDefined();
            expect(result.length).toBe(1);
            expect(result[0].title).toBe(reservation.title);
            expect(result[0].resource.type).toBe(ResourceType.MEETING_ROOM);
        });
    });

    describe('findMyCurrentReservation', () => {
        it('should find my current reservation', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 현재 진행 중인 예약 생성
            const startDate = DateUtil.now().addMinutes(-30).format();
            const endDate = DateUtil.now().addMinutes(30).format();

            const reservation = await dataSource.getRepository(Reservation).save({
                resourceId: resource.resourceId,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate,
                endDate: endDate,
                status: ReservationStatus.CONFIRMED,
                isAllDay: false,
                notifyBeforeStart: true,
                notifyMinutesBeforeStart: [10],
                resource: resource,
            });

            await dataSource.getRepository(ReservationParticipant).save({
                reservationId: reservation.reservationId,
                employeeId: TEST_EMPLOYEE_ID,
                isHost: true,
                type: ParticipantsType.RESERVER,
            });

            // 4. 현재 예약 조회
            const result = await reservationUsecase.findMyCurrentReservation(
                TEST_EMPLOYEE_ID,
                ResourceType.MEETING_ROOM,
            );

            expect(result).toBeDefined();
            expect(result.title).toBe(reservation.title);
            expect(result.resource.type).toBe(ResourceType.MEETING_ROOM);
        });
    });

    describe('findReservationList', () => {
        it('should find reservations with filters', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 예약 생성
            const startDate = DateUtil.now().addMinutes(60).format();
            const endDate = DateUtil.now().addMinutes(120).format();

            const reservation = await dataSource.getRepository(Reservation).save({
                resourceId: resource.resourceId,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate,
                endDate: endDate,
                status: ReservationStatus.CONFIRMED,
                isAllDay: false,
                notifyBeforeStart: true,
                notifyMinutesBeforeStart: [10],
                resource: resource,
            });

            // 4. 예약 목록 조회
            const result = await reservationUsecase.findReservationList(
                DateUtil.format(startDate, 'YYYY-MM-DD'),
                DateUtil.format(endDate, 'YYYY-MM-DD'),
                ResourceType.MEETING_ROOM,
                resource.resourceId,
                [ReservationStatus.CONFIRMED],
            );

            expect(result).toBeDefined();
            expect(result.length).toBe(1);
            expect(result[0].title).toBe(reservation.title);
            expect(result[0].resource.type).toBe(ResourceType.MEETING_ROOM);
        });

        it('should throw BadRequestException when start date is after end date', async () => {
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() - 1);

            await expect(
                reservationUsecase.findReservationList(
                    startDate.toISOString(),
                    endDate.toISOString(),
                    ResourceType.MEETING_ROOM,
                ),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateTitle', () => {
        it('should update reservation title', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 예약 생성
            const startDate = DateUtil.now().addMinutes(60).format();
            const endDate = DateUtil.now().addMinutes(120).format();

            const reservation = await dataSource.getRepository(Reservation).save({
                resourceId: resource.resourceId,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate,
                endDate: endDate,
                status: ReservationStatus.CONFIRMED,
                resource: resource,
            });

            // 4. 제목 수정
            const updateDto = {
                title: '수정된 제목',
            };

            const result = await reservationUsecase.updateTitle(reservation.reservationId, updateDto);

            expect(result).toBeDefined();
            expect(result.title).toBe(updateDto.title);
        });

        it('should throw NotFoundException when reservation not found', async () => {
            const updateDto = {
                title: '수정된 제목',
            };

            await expect(
                reservationUsecase.updateTitle('00000000-0000-0000-0000-000000000000', updateDto),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTime', () => {
        it('should update reservation time', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 예약 생성
            const startDate = DateUtil.now().addMinutes(60).format();
            const endDate = DateUtil.now().addMinutes(120).format();

            const reservation = await dataSource.getRepository(Reservation).save({
                resourceId: resource.resourceId,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate,
                endDate: endDate,
                status: ReservationStatus.CONFIRMED,
                resource: resource,
            });

            // 4. 시간 수정
            const newStartDate = DateUtil.now().addMinutes(120).format();
            const newEndDate = DateUtil.now().addMinutes(180).format();

            const updateDto = {
                startDate: newStartDate,
                endDate: newEndDate,
            };

            const result = await reservationUsecase.updateTime(reservation.reservationId, updateDto);

            expect(result).toBeDefined();
            expect(result.startDate).toBe(updateDto.startDate);
            expect(result.endDate).toBe(updateDto.endDate);
        });

        it('should throw NotFoundException when reservation not found', async () => {
            const updateDto = {
                startDate: DateUtil.now().addMinutes(240).format(),
                endDate: DateUtil.now().addMinutes(300).format(),
            };

            await expect(
                reservationUsecase.updateTime('00000000-0000-0000-0000-000000000000', updateDto),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateStatus', () => {
        it('should update reservation status when user is reserver', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 예약 생성
            const startDate = DateUtil.now().addMinutes(60).format();
            const endDate = DateUtil.now().addMinutes(120).format();

            const reservation = await dataSource.getRepository(Reservation).save({
                resourceId: resource.resourceId,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate,
                endDate: endDate,
                status: ReservationStatus.CONFIRMED,
                resource: resource,
            });

            await dataSource.getRepository(ReservationParticipant).save({
                reservationId: reservation.reservationId,
                employeeId: TEST_EMPLOYEE_ID,
                isHost: true,
                type: ParticipantsType.RESERVER,
            });

            // 4. 상태 수정
            const updateDto = {
                status: ReservationStatus.CANCELED,
            } as UpdateReservationStatusDto;

            const result = await reservationUsecase.updateStatus(
                reservation.reservationId,
                updateDto,
                TEST_EMPLOYEE_ID,
                false,
            );

            expect(result).toBeDefined();
            expect(result.status).toBe(updateDto.status);
        });

        it('should throw UnauthorizedException when user is not reserver or admin', async () => {
            // 1. 자원 그룹 생성
            const group = await resourceGroupService.save({
                title: '회의실',
                type: ResourceType.MEETING_ROOM,
                parentResourceGroupId: null,
                order: 0,
            } as ResourceGroup);

            // 2. 자원 생성
            const resource = await resourceService.save({
                name: '회의실 A',
                description: '회의실 A입니다.',
                type: ResourceType.MEETING_ROOM,
                resourceGroupId: group.resourceGroupId,
                order: 0,
                isAvailable: true,
                images: [],
            } as Resource);

            // 3. 예약 생성
            const startDate = DateUtil.now().addMinutes(60).format();
            const endDate = DateUtil.now().addMinutes(120).format();

            const reservation = await dataSource.getRepository(Reservation).save({
                resourceId: resource.resourceId,
                title: '테스트 예약',
                description: '테스트 예약입니다.',
                startDate: startDate,
                endDate: endDate,
                status: ReservationStatus.CONFIRMED,
                isAllDay: false,
                notifyBeforeStart: true,
                notifyMinutesBeforeStart: [10],
                resource: resource,
            });

            const updateDto = {
                status: ReservationStatus.CANCELLED,
            } as UpdateReservationStatusDto;

            await expect(
                reservationUsecase.updateStatus(reservation.reservationId, updateDto, 'non-reserver-id', false),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
