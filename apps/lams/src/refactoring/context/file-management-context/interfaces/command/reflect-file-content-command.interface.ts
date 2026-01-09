/**
 * 파일 내용 반영 커맨드 인터페이스
 */
export interface IReflectFileContentCommand {
    fileId: string;
    employeeIds: string[];
    year: string;
    month: string;
    day?: string; // 특정 일자만 반영하는 경우
    performedBy: string;
}

