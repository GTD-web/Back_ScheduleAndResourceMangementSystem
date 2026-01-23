/**
 * 파일 내용 반영을 위한 기존 데이터 삭제 커맨드 인터페이스
 */
export interface IDeleteExistingDataForReflectionCommand {
    fileType: string;
    year: string;
    month: string;
    employeeIds: string[];
    employeeNumbers: string[]; // employeeMap의 키 목록
    selectedEmployeeIds: string[]; // employeeIdMap의 값 목록
    deleteAll?: boolean; // 전체 삭제 여부 (true인 경우 직원 필터링 없이 전체 삭제)
}
