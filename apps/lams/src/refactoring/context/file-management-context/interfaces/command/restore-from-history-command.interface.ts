/**
 * 이력으로 되돌리기 커맨드 인터페이스
 */
export interface IRestoreFromHistoryCommand {
    reflectionHistoryId: string;
    performedBy: string;
}
