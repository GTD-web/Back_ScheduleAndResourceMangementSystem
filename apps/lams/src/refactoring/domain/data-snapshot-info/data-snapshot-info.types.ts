/**
 * 데이터 스냅샷 정보 관련 타입 정의
 */

/**
 * 스냅샷 타입
 */
export enum SnapshotType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    ANNUAL = 'ANNUAL_LEAVE',
}

/**
 * 데이터 스냅샷 정보 생성 데이터
 */
export interface CreateDataSnapshotInfoData {
    snapshotName: string;
    description?: string;
    snapshotType: SnapshotType;
    yyyy: string;
    mm: string;
    departmentId: string;
}

/**
 * 데이터 스냅샷 정보 업데이트 데이터
 */
export interface UpdateDataSnapshotInfoData {
    snapshotName?: string;
    description?: string;
}

/**
 * 데이터 스냅샷 정보 DTO
 */
export interface DataSnapshotInfoDTO {
    id: string;
    snapshotName: string;
    description: string;
    snapshotType: SnapshotType;
    yyyy: string;
    mm: string;
    departmentId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

