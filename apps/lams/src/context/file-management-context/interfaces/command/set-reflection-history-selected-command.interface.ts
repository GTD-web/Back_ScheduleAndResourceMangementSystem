/**
 * 반영이력 선택 상태 설정 커맨드 인터페이스
 */
export interface ISetReflectionHistorySelectedCommand {
    reflectionHistoryId: string;
    performedBy: string;
}
