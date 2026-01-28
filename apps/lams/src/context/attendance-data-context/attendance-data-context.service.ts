import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
    GenerateDailySummariesCommand,
    GenerateMonthlySummariesCommand,
    UpdateDailySummaryCommand,
    GetMonthlySummariesQuery,
    GetDailySummaryHistoryQuery,
    GetDailySummaryDetailQuery,
    SoftDeleteDailySummariesCommand,
    SoftDeleteMonthlySummariesCommand,
    CreateAttendanceIssuesCommand,
    RestoreDailySummariesFromSnapshotCommand,
    RestoreMonthlySummariesFromSnapshotCommand,
} from './handlers';
import {
    IGenerateDailySummariesResponse,
    IGenerateMonthlySummariesResponse,
    IGetMonthlySummariesResponse,
    IGetMonthlySummariesQuery,
    IGetDailySummaryHistoryQuery,
    IGetDailySummaryHistoryResponse,
    IGetDailySummaryDetailQuery,
    IGetDailySummaryDetailResponse,
    IUpdateDailySummaryCommand,
    IUpdateDailySummaryResponse,
    IGenerateDailySummariesCommand,
    IRestoreDailySummariesFromSnapshotCommand,
    IRestoreMonthlySummariesFromSnapshotCommand,
} from './interfaces';
import { DailyEventSummary } from '../../domain/daily-event-summary/daily-event-summary.entity';
import { MonthlyEventSummary } from '../../domain/monthly-event-summary/monthly-event-summary.entity';

/**
 * 출입/근태 데이터 가공 Context Service
 *
 * CommandBus/QueryBus를 통해 Handler를 호출하는 서비스 레이어입니다.
 */
@Injectable()
export class AttendanceDataContextService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    /**
     * 일일 요약을 생성한다
     *
     * flow.md의 "파일내용 반영 후 처리" 흐름 중 일일 요약 생성 부분을 구현합니다.
     *
     * 오케스트레이션 로직:
     * 1. 일일요약 소프트 삭제 핸들러 호출
     * 2. GenerateDailySummariesCommand 실행
     * 3. 근태 이슈 생성 핸들러 호출
     * 4. 결과 반환
     *
     * @param command 일일 요약 생성 명령
     * @returns 일일 요약 생성 결과
     */
    async 일일요약을생성한다(command: IGenerateDailySummariesCommand): Promise<IGenerateDailySummariesResponse> {
        const { year, month, performedBy } = command;

        // 1. 일일요약 소프트 삭제 핸들러 호출
        await this.commandBus.execute(
            new SoftDeleteDailySummariesCommand({
                year,
                month,
                performedBy,
            }),
        );

        // 2. GenerateDailySummariesCommand 실행
        const result = await this.commandBus.execute(
            new GenerateDailySummariesCommand({
                year,
                month,
                performedBy,
            }),
        );
        const summaries = result.summaries || [];

        // 3. 근태 이슈 생성 핸들러 호출
        const issues = await this.commandBus.execute(
            new CreateAttendanceIssuesCommand({
                summaries,
                performedBy,
            }),
        );

        // 4. 결과 반환
        return {
            success: true,
            statistics: {
                dailyEventSummaryCount: summaries.length,
                attendanceIssueCount: issues.length,
            },
        };
    }

    /**
     * 월간 요약을 생성한다
     *
     * flow.md의 "파일내용 반영 후 처리" 흐름 중 월간 요약 생성 부분을 구현합니다.
     * 해당 연월에 일간 요약이 있는 모든 직원의 월간 요약을 생성합니다.
     *
     * 오케스트레이션 로직:
     * 1. 월간요약 소프트 삭제 핸들러 호출
     * 2. GenerateMonthlySummariesCommand 실행
     * 3. 결과 반환
     *
     * @param year 연도
     * @param month 월
     * @param performedBy 수행자 ID
     * @returns 월간 요약 생성 결과
     */
    async 월간요약을생성한다(
        year: string,
        month: string,
        performedBy: string,
    ): Promise<IGenerateMonthlySummariesResponse> {
        // 1. 월간요약 소프트 삭제 핸들러 호출
        await this.commandBus.execute(
            new SoftDeleteMonthlySummariesCommand({
                year,
                month,
                performedBy,
            }),
        );

        // 2. GenerateMonthlySummariesCommand 실행
        const command = new GenerateMonthlySummariesCommand({
            year,
            month,
            performedBy,
        });
        return await this.commandBus.execute(command);
    }

    /**
     * 일일 요약을 복원한다
     *
     * 스냅샷 데이터를 기반으로 일일 요약을 복원합니다.
     *
     * @param command 일일 요약 복원 명령
     * @returns 복원된 일일 요약 목록
     */
    async 일일요약을복원한다(
        command: IRestoreDailySummariesFromSnapshotCommand,
    ): Promise<DailyEventSummary[]> {
        return await this.commandBus.execute(new RestoreDailySummariesFromSnapshotCommand(command));
    }

    /**
     * 월간 요약을 복원한다
     *
     * 스냅샷 데이터를 기반으로 월간 요약을 복원합니다.
     *
     * @param command 월간 요약 복원 명령
     * @returns 복원된 월간 요약 목록
     */
    async 월간요약을복원한다(
        command: IRestoreMonthlySummariesFromSnapshotCommand,
    ): Promise<MonthlyEventSummary[]> {
        return await this.commandBus.execute(new RestoreMonthlySummariesFromSnapshotCommand(command));
    }

    /**
     * 월간 요약을 조회한다
     *
     * 연도, 월, 부서ID를 기준으로 월간 요약, 일간 요약, 일간 요약의 수정이력을 조회합니다.
     *
     * @param query 조회 조건
     * @returns 월간 요약 조회 결과
     */
    async 월간요약을조회한다(query: IGetMonthlySummariesQuery): Promise<IGetMonthlySummariesResponse> {
        const queryCommand = new GetMonthlySummariesQuery(query);
        return await this.queryBus.execute(queryCommand);
    }

    /**
     * 일간 요약을 수정한다
     *
     * 일간 요약의 출근시간, 퇴근시간, 근태유형을 수정하고 수정이력을 생성합니다.
     *
     * @param command 수정 명령
     * @returns 일간 요약 수정 결과
     */
    async 일간요약을수정한다(command: IUpdateDailySummaryCommand): Promise<IUpdateDailySummaryResponse> {
        const commandInstance = new UpdateDailySummaryCommand(command);
        return await this.commandBus.execute(commandInstance);
    }

    /**
     * 일간 요약 수정이력을 조회한다
     *
     * 일간 요약 ID를 기준으로 해당 일간 요약의 수정이력을 조회합니다.
     *
     * @param query 조회 조건
     * @returns 일간 요약 수정이력 조회 결과
     */
    async 일간요약수정이력을조회한다(query: IGetDailySummaryHistoryQuery): Promise<IGetDailySummaryHistoryResponse> {
        const queryInstance = new GetDailySummaryHistoryQuery(query);
        return await this.queryBus.execute(queryInstance);
    }

    /**
     * 일간 요약 상세를 조회한다
     *
     * 일간 요약 ID를 기준으로 해당 일간 요약의 상세 정보, 수정이력, 근태 이슈를 조회합니다.
     *
     * @param query 조회 조건
     * @returns 일간 요약 상세 조회 결과
     */
    async 일간요약상세를조회한다(query: IGetDailySummaryDetailQuery): Promise<IGetDailySummaryDetailResponse> {
        const queryInstance = new GetDailySummaryDetailQuery(query);
        return await this.queryBus.execute(queryInstance);
    }
}
