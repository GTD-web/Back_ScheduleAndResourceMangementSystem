import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
    GenerateDailySummariesCommand,
    GenerateMonthlySummariesCommand,
    UpdateDailySummaryCommand,
    GetMonthlySummariesQuery,
} from './handlers';
import {
    IGenerateDailySummariesResponse,
    IGenerateMonthlySummariesResponse,
    IGetMonthlySummariesResponse,
    IGetMonthlySummariesQuery,
    IUpdateDailySummaryCommand,
    IUpdateDailySummaryResponse,
} from './interfaces';

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
     * @param employeeIds 직원 ID 목록
     * @param year 연도
     * @param month 월
     * @param performedBy 수행자 ID
     * @param day 일자 (선택)
     * @returns 일일 요약 생성 결과
     */
    async 일일요약을생성한다(
        year: string,
        month: string,
        performedBy: string,
    ): Promise<IGenerateDailySummariesResponse> {
        const command = new GenerateDailySummariesCommand({
            year,
            month,
            performedBy,
        });
        return await this.commandBus.execute(command);
    }

    /**
     * 월간 요약을 생성한다
     *
     * flow.md의 "파일내용 반영 후 처리" 흐름 중 월간 요약 생성 부분을 구현합니다.
     * 해당 연월에 일간 요약이 있는 모든 직원의 월간 요약을 생성합니다.
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
        const command = new GenerateMonthlySummariesCommand({
            year,
            month,
            performedBy,
        });
        return await this.commandBus.execute(command);
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
}
