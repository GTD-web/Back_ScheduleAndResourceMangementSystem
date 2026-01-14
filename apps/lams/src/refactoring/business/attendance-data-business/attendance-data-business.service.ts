import { Injectable, Logger } from '@nestjs/common';
import { AttendanceDataContextService } from '../../context/attendance-data-context/attendance-data-context.service';
import { DataSnapshotContextService } from '../../context/data-snapshot-context/data-snapshot-context.service';
import {
    IGetMonthlySummariesResponse,
    IGetMonthlySummariesQuery,
    IUpdateDailySummaryCommand,
    IUpdateDailySummaryResponse,
} from '../../context/attendance-data-context/interfaces';
import {
    ISaveAttendanceSnapshotCommand,
    ISaveAttendanceSnapshotResponse,
    IRestoreFromSnapshotCommand,
    IRestoreFromSnapshotResponse,
    IGetSnapshotListQuery,
    IGetSnapshotListResponse,
} from '../../context/data-snapshot-context/interfaces';

/**
 * 출입/근태 데이터 비즈니스 서비스
 *
 * 출입/근태 데이터 관련 비즈니스 로직을 오케스트레이션합니다.
 * - 월간 요약 조회
 */
@Injectable()
export class AttendanceDataBusinessService {
    private readonly logger = new Logger(AttendanceDataBusinessService.name);

    constructor(
        private readonly attendanceDataContextService: AttendanceDataContextService,
        private readonly dataSnapshotContextService: DataSnapshotContextService,
    ) {}

    /**
     * 월간 요약을 조회한다
     *
     * 연도, 월, 부서ID를 기준으로 월간 요약, 일간 요약, 일간 요약의 수정이력을 조회합니다.
     *
     * @param query 조회 조건
     * @returns 월간 요약 조회 결과
     */
    async 월간요약을조회한다(query: IGetMonthlySummariesQuery): Promise<IGetMonthlySummariesResponse> {
        this.logger.log(`월간 요약 조회: year=${query.year}, month=${query.month}, departmentId=${query.departmentId}`);
        return await this.attendanceDataContextService.월간요약을조회한다(query);
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
        this.logger.log(`일간 요약 수정: dailySummaryId=${command.dailySummaryId}`);
        return await this.attendanceDataContextService.일간요약을수정한다(command);
    }

    /**
     * 근태 스냅샷을 저장한다
     *
     * 부서별로 계산된 월별요약-일별요약에 대한 데이터를 스냅샷으로 저장합니다.
     *
     * @param command 저장 명령
     * @returns 스냅샷 저장 결과
     */
    async 근태스냅샷을저장한다(command: ISaveAttendanceSnapshotCommand): Promise<ISaveAttendanceSnapshotResponse> {
        this.logger.log(
            `근태 스냅샷 저장: year=${command.year}, month=${command.month}, departmentId=${command.departmentId}`,
        );
        return await this.dataSnapshotContextService.근태스냅샷을저장한다(command);
    }

    /**
     * 스냅샷으로부터 복원한다
     *
     * 선택된 스냅샷 데이터를 기반으로 월간/일간 요약 데이터를 덮어씌웁니다.
     *
     * @param command 복원 명령
     * @returns 복원 결과
     */
    async 스냅샷으로부터복원한다(command: IRestoreFromSnapshotCommand): Promise<IRestoreFromSnapshotResponse> {
        this.logger.log(`스냅샷으로부터 복원: snapshotId=${command.snapshotId}`);
        return await this.dataSnapshotContextService.스냅샷으로부터복원한다(command);
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
        this.logger.log(
            `스냅샷 목록 조회: year=${query.year}, month=${query.month}, departmentId=${query.departmentId}`,
        );
        return await this.dataSnapshotContextService.스냅샷목록을조회한다(query);
    }
}
