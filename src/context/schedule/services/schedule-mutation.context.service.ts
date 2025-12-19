import { Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { DomainScheduleService } from '../../../domain/schedule/schedule.service';
import { DomainScheduleParticipantService } from '../../../domain/schedule-participant/schedule-participant.service';
import { DomainScheduleRelationService } from '../../../domain/schedule-relation/schedule-relation.service';
import { DomainScheduleDepartmentService } from '../../../domain/schedule-department/schedule-department.service';
import { ReservationContextService } from '../../reservation/services/reservation.context.service';
import { Employee } from '../../../../libs/entities/employee.entity';
import {
    CreateScheduleDto,
    CreateScheduleParticipantDto,
    CreateScheduleRelationDto,
} from '../dtos/create-schedule.dto';
import { Schedule } from '../../../../libs/entities/schedule.entity';
import { ScheduleRelation } from '../../../../libs/entities/schedule-relations.entity';
import { ScheduleStatus, ScheduleType } from '../../../../libs/enums/schedule-type.enum';
import { ParticipantsType, ReservationStatus } from '../../../../libs/enums/reservation-type.enum';
import { ResourceType } from '../../../../libs/enums/resource-type.enum';

export interface ScheduleCreateResult {
    createdSchedules: Schedule[];
    failedSchedules: { startDate: string; endDate: string; reason: string }[];
}

@Injectable()
export class ScheduleMutationContextService {
    private readonly logger = new Logger(ScheduleMutationContextService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly domainScheduleService: DomainScheduleService,
        private readonly domainScheduleParticipantService: DomainScheduleParticipantService,
        private readonly domainScheduleRelationService: DomainScheduleRelationService,
        private readonly domainScheduleDepartmentService: DomainScheduleDepartmentService,
        private readonly reservationContextService: ReservationContextService,
    ) {}

    /**
     * 일정을 생성합니다
     */
    async 일정을_생성한다(scheduleData: CreateScheduleDto, queryRunner?: QueryRunner): Promise<Schedule> {
        const scheduleEntity = {
            title: scheduleData.title,
            description: scheduleData.description,
            location: scheduleData.location,
            startDate: scheduleData.startDate,
            endDate: scheduleData.endDate,
            notifyBeforeStart: scheduleData.notifyBeforeStart || false,
            notifyMinutesBeforeStart: scheduleData.notifyMinutesBeforeStart || [],
            scheduleType: scheduleData.scheduleType,
            status: scheduleData.startDate < new Date() ? ScheduleStatus.PROCESSING : ScheduleStatus.PENDING, // 기본 상태 설정
            scheduleDepartment: scheduleData.scheduleDepartment,
        };

        // 도메인 서비스를 사용하여 트랜잭션 내에서 생성
        const savedSchedule = await this.domainScheduleService.save(scheduleEntity, {
            queryRunner: queryRunner,
        });

        return savedSchedule;
    }

    /**
     * 일정 참가자를 추가합니다
     */
    async 일정_참가자를_추가한다(
        scheduleId: string,
        employeeId: string,
        type: string,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        /**
         * 참가자 중복 체크
         * 도메인 수준에서 중복을 체크하는 함수을 만들고 컨텍스트 수준에서 체크와 저장하는 함수를 모두 사용해서 컨텍스트 함수를 작성한다.
         */
        const isParticipant = await this.domainScheduleParticipantService.checkParticipantByScheduleIdAndType(
            employeeId,
            scheduleId,
            type as ParticipantsType,
        );

        if (isParticipant) {
            return;
        }

        const participantEntity = {
            scheduleId: scheduleId,
            employeeId: employeeId,
            type: type as ParticipantsType,
        };

        /**
         * 도메인 서비스를 사용하여 트랜잭션 내에서 생성
         */
        await this.domainScheduleParticipantService.save(participantEntity, {
            queryRunner: queryRunner,
        });
    }

    /**
     * 일정관계정보를 생성합니다
     */
    async 일정관계정보를_생성한다(
        relationData: CreateScheduleRelationDto,
        queryRunner?: QueryRunner,
    ): Promise<ScheduleRelation> {
        const relationEntity = {
            scheduleId: relationData.scheduleId,
            projectId: relationData.projectId,
            reservationId: relationData.reservationId,
        };

        // 도메인 서비스를 사용하여 트랜잭션 내에서 생성
        return await this.domainScheduleRelationService.save(relationEntity, {
            queryRunner: queryRunner,
        });
    }

    /**
     * 일정 부서 관계들을 생성합니다
     */
    async 일정_부서관계들을_생성한다(
        scheduleId: string,
        departmentIds: string[],
        queryRunner?: QueryRunner,
    ): Promise<void> {
        if (!departmentIds || departmentIds.length === 0) {
            return;
        }

        // 각 부서별로 관계 생성
        for (const departmentId of departmentIds) {
            const createDto = {
                scheduleId,
                departmentId,
            };

            // 도메인 서비스를 사용하여 트랜잭션 내에서 생성
            // DomainScheduleDepartmentService.save 메서드를 직접 사용
            await this.domainScheduleDepartmentService.save(createDto, {
                queryRunner: queryRunner,
            });
        }

        this.logger.log(`일정 부서 관계 생성 완료: Schedule ${scheduleId}, Departments [${departmentIds.join(', ')}]`);
    }

    /**
     * 일정 상태를 업데이트합니다
     */
    async 일정_상태를_변경한다(
        scheduleId: string,
        status: ScheduleStatus,
        completionReason?: string,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const updateData: any = { status };

        if (completionReason) {
            updateData.completionReason = completionReason;
        }

        await this.domainScheduleService.update(scheduleId, updateData, { queryRunner });
    }

    // /**
    //  * 다중 일정을 생성합니다 (레거시 로직 유지)
    //  * - 날짜별로 개별 트랜잭션 처리
    //  * - 실패한 일정과 성공한 일정을 분리하여 반환
    //  */
    // async 다중_일정을_생성한다(
    //     user: any,
    //     createData: {
    //         title: string;
    //         description?: string;
    //         location?: string;
    //         scheduleType: ScheduleType;
    //         notifyBeforeStart?: boolean;
    //         notifyMinutesBeforeStart?: number[];
    //         participants: { employeeId: string }[];
    //         datesSelection: { startDate: string; endDate: string }[];
    //         resourceSelection?: {
    //             resourceId: string;
    //             resourceType: ResourceType;
    //         };
    //         projectSelection?: {
    //             projectId: string;
    //         };
    //     },
    // ): Promise<ScheduleCreateResult> {
    //     const createdSchedules = [];
    //     const failedSchedules = [];
    //     const {
    //         title,
    //         description,
    //         location,
    //         scheduleType,
    //         notifyBeforeStart,
    //         notifyMinutesBeforeStart,
    //         participants,
    //         datesSelection,
    //         resourceSelection,
    //         projectSelection,
    //     } = createData;

    //     // 레거시 로직 유지: 날짜별 트랜잭션 처리
    //     for (const dateRange of datesSelection) {
    //         // 트랜잭션 시작 - 개별 일정에 대한 모든 작업
    //         const queryRunner = this.dataSource.createQueryRunner();
    //         await queryRunner.connect();
    //         await queryRunner.startTransaction();

    //         try {
    //             // 1) 일정 생성
    //             const scheduleData = {
    //                 title,
    //                 description: location ? `${description || ''}\n장소: ${location}`.trim() : description,
    //                 startDate: new Date(dateRange.startDate),
    //                 endDate: new Date(dateRange.endDate),
    //                 scheduleType,
    //                 notifyBeforeStart: notifyBeforeStart || false,
    //                 notifyMinutesBeforeStart: notifyMinutesBeforeStart || [],
    //             };

    //             const createdSchedule = await this.일정을_생성한다(scheduleData, queryRunner);

    //             // 2) 참가자 생성
    //             // 예약자(요청자) 추가
    //             await this.일정_참가자를_추가한다(
    //                 createdSchedule.scheduleId!,
    //                 user.employeeId,
    //                 'RESERVER',
    //                 queryRunner,
    //             );

    //             // 다른 참석자들 추가
    //             for (const participant of participants) {
    //                 if (participant.employeeId !== user.employeeId) {
    //                     await this.일정_참가자를_추가한다(
    //                         createdSchedule.scheduleId!,
    //                         participant.employeeId,
    //                         'PARTICIPANT',
    //                         queryRunner,
    //                     );
    //                 }
    //             }

    //             // 3) 자원예약 생성 (있는 경우)
    //             let reservationId: string | null = null;
    //             if (resourceSelection) {
    //                 const reservationData = {
    //                     title: title,
    //                     description: description || '',
    //                     resourceId: resourceSelection.resourceId,
    //                     resourceType: resourceSelection.resourceType,
    //                     status:
    //                         resourceSelection.resourceType === ResourceType.ACCOMMODATION
    //                             ? ReservationStatus.PENDING
    //                             : ReservationStatus.CONFIRMED,
    //                     startDate: new Date(dateRange.startDate),
    //                     endDate: new Date(dateRange.endDate),
    //                 };

    //                 const createdReservation = await this.reservationContextService.자원예약을_생성한다(
    //                     reservationData,
    //                     queryRunner,
    //                 );
    //                 reservationId = createdReservation.reservationId!;
    //             }

    //             // 4) 일정관계정보 생성
    //             const relationData = {
    //                 scheduleId: createdSchedule.scheduleId!,
    //                 projectId: projectSelection?.projectId || null,
    //                 reservationId: reservationId,
    //             };

    //             await this.일정관계정보를_생성한다(relationData, queryRunner);

    //             // 트랜잭션 커밋
    //             await queryRunner.commitTransaction();
    //             createdSchedules.push(createdSchedule);
    //         } catch (error) {
    //             // 트랜잭션 롤백
    //             await queryRunner.rollbackTransaction();

    //             failedSchedules.push({
    //                 startDate: dateRange.startDate,
    //                 endDate: dateRange.endDate,
    //                 reason: `일정 생성 실패: ${error.message}`,
    //             });
    //         } finally {
    //             // 쿼리러너 해제
    //             await queryRunner.release();
    //         }
    //     }

    //     return {
    //         createdSchedules,
    //         failedSchedules,
    //     };
    // }

    /**
     * 단일 일정을 예약과 함께 하나의 트랜잭션으로 생성
     */
    async 일정생성_예약생성_트랜잭션을_실행한다(
        user: Employee,
        data: {
            title: string;
            description?: string;
            location?: string;
            scheduleType: ScheduleType;
            notifyBeforeStart?: boolean;
            notifyMinutesBeforeStart?: number[];
            participants: { employeeId: string }[];
            dateRange: { startDate: string; endDate: string };
            resourceSelection?: {
                resourceId: string;
                resourceType: ResourceType;
            };
            projectSelection?: {
                projectId: string;
            };
            departmentIds?: string[];
        },
    ): Promise<{ success: boolean; schedule?: Schedule; reason?: string }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let reservationId: string | null = null;

            // 1) 자원 예약 생성 (있는 경우)
            if (data.resourceSelection) {
                // 예약 가능 여부 확인
                const isAvailable = await this.reservationContextService.자원예약이_가능한지_확인한다(
                    data.resourceSelection.resourceId,
                    new Date(data.dateRange.startDate),
                    new Date(data.dateRange.endDate),
                );

                if (!isAvailable) {
                    await queryRunner.rollbackTransaction();
                    return {
                        success: false,
                        reason: '선택한 시간대에 자원이 이미 예약되어 있습니다.',
                    };
                }

                // 예약 생성 (QueryRunner 전달)
                const reservationData = {
                    title: data.title,
                    description: data.description || '',
                    resourceId: data.resourceSelection.resourceId,
                    resourceType: data.resourceSelection.resourceType,
                    status:
                        data.resourceSelection.resourceType === ResourceType.ACCOMMODATION
                            ? ReservationStatus.PENDING
                            : ReservationStatus.CONFIRMED,
                    startDate: new Date(data.dateRange.startDate),
                    endDate: new Date(data.dateRange.endDate),
                };

                const createdReservation = await this.reservationContextService.자원예약을_생성한다(
                    reservationData,
                    queryRunner, // 🔥 QueryRunner 전달
                );
                reservationId = createdReservation.reservationId;
            }

            // 2) 일정 생성 (QueryRunner 전달)
            const scheduleData = {
                title: data.title,
                description: data.location
                    ? `${data.description || ''}\n장소: ${data.location}`.trim()
                    : data.description,
                startDate: new Date(data.dateRange.startDate),
                endDate: new Date(data.dateRange.endDate),
                scheduleType: data.scheduleType,
                notifyBeforeStart: data.notifyBeforeStart || false,
                notifyMinutesBeforeStart: data.notifyMinutesBeforeStart || [],
            };

            const createdSchedule = await this.일정을_생성한다(
                scheduleData,
                queryRunner, // 🔥 QueryRunner 전달
            );

            // 3) 참가자 생성
            await this.일정_참가자를_추가한다(createdSchedule.scheduleId!, user.employeeId, 'RESERVER', queryRunner);

            for (const participant of data.participants) {
                if (participant.employeeId !== user.employeeId) {
                    await this.일정_참가자를_추가한다(
                        createdSchedule.scheduleId!,
                        participant.employeeId,
                        'PARTICIPANT',
                        queryRunner,
                    );
                }
            }

            // 4) 일정관계정보 생성 (예약, 프로젝트 관계)
            const relationData = {
                scheduleId: createdSchedule.scheduleId!,
                projectId: data.projectSelection?.projectId || null,
                reservationId: reservationId,
            };

            await this.일정관계정보를_생성한다(relationData, queryRunner);

            // 5) 부서 관계 정보 생성 (새로운 schedule_departments 테이블 사용)
            if (data.departmentIds && data.departmentIds.length > 0) {
                await this.일정_부서관계들을_생성한다(createdSchedule.scheduleId!, data.departmentIds, queryRunner);
            }

            // 트랜잭션 커밋
            await queryRunner.commitTransaction();

            return {
                success: true,
                schedule: createdSchedule,
            };
        } catch (error) {
            // 트랜잭션 롤백
            await queryRunner.rollbackTransaction();

            return {
                success: false,
                reason: `일정 생성 실패: ${error.message}`,
            };
        } finally {
            // 쿼리러너 해제
            await queryRunner.release();
        }
    }
}
