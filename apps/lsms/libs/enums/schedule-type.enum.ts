export enum ScheduleType {
    COMPANY = 'COMPANY', // 회사전체일정
    DEPARTMENT = 'DEPARTMENT', // 부서일정
    PERSONAL = 'PERSONAL', // 개인일정
}

export enum ScheduleStatus {
    PENDING = 'PENDING', // 대기
    PROCESSING = 'PROCESSING', // 진행중
    COMPLETED = 'COMPLETED', // 완료
    CANCELLED = 'CANCELLED', // 취소
}
