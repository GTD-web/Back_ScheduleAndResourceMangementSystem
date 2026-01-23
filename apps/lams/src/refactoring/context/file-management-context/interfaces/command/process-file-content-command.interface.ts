/**
 * 파일 내용 가공 커맨드 인터페이스
 */
export interface IProcessFileContentCommand {
    fileId: string;
    employeeIds: string[];
    year: string;
    month: string;
    day?: string; // 특정 일자만 가공하는 경우
    performedBy: string;
    info?: string; // 추가 정보 (선택사항)
}
