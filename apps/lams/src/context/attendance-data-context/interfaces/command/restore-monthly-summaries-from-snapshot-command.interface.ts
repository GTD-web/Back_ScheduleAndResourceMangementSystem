import { DataSnapshotInfoDTO } from '../../../../domain/data-snapshot-info/data-snapshot-info.types';

/**
 * 스냅샷 기반 월간요약 복원 커맨드 인터페이스
 *
 * 스냅샷 데이터 전체를 받아서 핸들러 내부에서 월간요약 데이터를 추출합니다.
 */
export interface IRestoreMonthlySummariesFromSnapshotCommand {
    snapshotData: DataSnapshotInfoDTO;
    year: string;
    month: string;
    performedBy: string;
}
