/**
 * 파일 내용 반영 이력 저장 커맨드 인터페이스
 */
export interface ISaveReflectionHistoryCommand {
    fileId: string;
    dataSnapshotInfoId?: string;
    info?: string;
}
