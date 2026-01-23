/**
 * 데이터 스냅샷 자식 관련 타입 정의
 */

/**
 * 부모 데이터 타입
 */
export type ParentDataType = {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    yyyymm: string;
};

/**
 * 데이터 스냅샷 자식 생성 데이터
 */
export interface CreateDataSnapshotChildData {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    yyyy: string;
    mm: string;
    snapshotData: string;
    rawData?: Record<string, any> | null;
}

/**
 * 데이터 스냅샷 자식 업데이트 데이터
 */
export interface UpdateDataSnapshotChildData {
    employeeName?: string;
    employeeNumber?: string;
    snapshotData?: string;
    rawData?: Record<string, any> | null;
}

/**
 * 데이터 스냅샷 자식 DTO
 */
export interface DataSnapshotChildDTO {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    yyyy: string;
    mm: string;
    snapshotData: string;
    rawData?: Record<string, any> | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

