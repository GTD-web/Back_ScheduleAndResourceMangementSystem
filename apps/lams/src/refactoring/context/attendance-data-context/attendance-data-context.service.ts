import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GenerateDailySummariesCommand, GenerateMonthlySummariesCommand } from './handlers';
import { IGenerateDailySummariesResponse, IGenerateMonthlySummariesResponse } from './interfaces';

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
        employeeIds: string[],
        year: string,
        month: string,
        performedBy: string,
    ): Promise<IGenerateDailySummariesResponse> {
        const command = new GenerateDailySummariesCommand({
            employeeIds,
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
     *
     * @param employeeIds 직원 ID 목록
     * @param year 연도
     * @param month 월
     * @param performedBy 수행자 ID
     * @returns 월간 요약 생성 결과
     */
    async 월간요약을생성한다(
        employeeIds: string[],
        year: string,
        month: string,
        performedBy: string,
    ): Promise<IGenerateMonthlySummariesResponse> {
        const command = new GenerateMonthlySummariesCommand({
            employeeIds,
            year,
            month,
            performedBy,
        });
        return await this.commandBus.execute(command);
    }
}
