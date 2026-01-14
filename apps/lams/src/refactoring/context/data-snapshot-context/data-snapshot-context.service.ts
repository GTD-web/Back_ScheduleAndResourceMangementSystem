import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
    SaveAttendanceSnapshotCommand,
    SaveAllDepartmentsMonthlySnapshotCommand,
    RestoreFromSnapshotCommand,
    GetSnapshotListQuery,
} from './handlers';
import {
    ISaveAttendanceSnapshotCommand,
    ISaveAttendanceSnapshotResponse,
    ISaveAllDepartmentsMonthlySnapshotCommand,
    IRestoreFromSnapshotCommand,
    IRestoreFromSnapshotResponse,
    IGetSnapshotListQuery,
    IGetSnapshotListResponse,
} from './interfaces';

/**
 * 데이터 스냅샷 Context Service
 *
 * CommandBus와 QueryBus를 통해 Handler를 호출하는 서비스 레이어입니다.
 */
@Injectable()
export class DataSnapshotContextService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    /**
     * 근태 스냅샷을 저장한다
     *
     * 부서별로 계산된 월별요약-일별요약에 대한 데이터를 스냅샷으로 저장합니다.
     *
     * @param command 저장 명령
     * @returns 스냅샷 저장 결과
     */
    async 근태스냅샷을저장한다(command: ISaveAttendanceSnapshotCommand): Promise<ISaveAttendanceSnapshotResponse> {
        const commandInstance = new SaveAttendanceSnapshotCommand(command);
        return await this.commandBus.execute(commandInstance);
    }

    /**
     * 해당 연월의 모든 부서에 대한 기존 월간 요약 데이터가 있다면 스냅샷으로 저장한다
     *
     * 파일 내용 반영 전에 기존 데이터를 보존하기 위해 스냅샷으로 저장합니다.
     * 해당 연월에 월간 요약이 있는 모든 부서의 스냅샷을 저장합니다.
     *
     * @param year 연도
     * @param month 월
     * @param performedBy 수행자 ID
     */
    async 해당연월의모든부서기존월간요약스냅샷을저장한다(
        year: string,
        month: string,
        performedBy: string,
    ): Promise<void> {
        const commandInstance = new SaveAllDepartmentsMonthlySnapshotCommand({
            year,
            month,
            performedBy,
        });
        await this.commandBus.execute(commandInstance);
    }

    /**
     * 스냅샷으로부터 복원한다
     *
     * 선택된 스냅샷 데이터를 기반으로 월간/일간 요약 데이터를 덮어씌웁니다.
     *
     * @param command 복원 명령
     * @returns 복원 결과
     */
    async 스냅샷으로부터복원한다(
        command: IRestoreFromSnapshotCommand,
    ): Promise<IRestoreFromSnapshotResponse> {
        const commandInstance = new RestoreFromSnapshotCommand(command);
        return await this.commandBus.execute(commandInstance);
    }

    /**
     * 스냅샷 목록을 조회한다
     *
     * 연월과 부서별을 기준으로 스냅샷 데이터를 조회합니다.
     * 기본적으로 가장 최신 스냅샷을 반환하며, 조건 변경에 유연하게 대응할 수 있도록 구성됩니다.
     *
     * @param query 스냅샷 목록 조회 쿼리
     * @returns 스냅샷 목록 조회 결과
     */
    async 스냅샷목록을조회한다(query: IGetSnapshotListQuery): Promise<IGetSnapshotListResponse> {
        const queryInstance = new GetSnapshotListQuery(query);
        return await this.queryBus.execute(queryInstance);
    }
}
