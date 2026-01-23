import { ChildEntity, JoinColumn, OneToOne } from 'typeorm';
import { DataSnapshotInfoEntity } from '../data-snapshot-info.entity';
import { ApprovalRequestBaseInfoEntity } from './approval-request-info.entity';

export enum SnapshotApprovalRequestStatus {
    CREATE_SNAPSHOT_REQUEST = '월 근태 현황 스냅샷 결재 요청',
    CREATE_SNAPSHOT_APPROVAL = '월 근태 현황 스냅샷 결재 승인',
    CREATE_SNAPSHOT_REJECTION = '월 근태 현황 스냅샷 결재 거절',
    CANCEL_SNAPSHOT_CANCELLATION = '월 근태 현황 스냅샷 결재 취소',
}
@ChildEntity()
export class DataSnapshotApprovalRequestInfoEntity extends ApprovalRequestBaseInfoEntity {
    @OneToOne(() => DataSnapshotInfoEntity, { cascade: true })
    @JoinColumn()
    dataSnapshot: DataSnapshotInfoEntity;

    cancel() {
        this.status = SnapshotApprovalRequestStatus.CANCEL_SNAPSHOT_CANCELLATION;
    }

    approve() {
        this.status = SnapshotApprovalRequestStatus.CREATE_SNAPSHOT_APPROVAL;
    }

    reject() {
        this.status = SnapshotApprovalRequestStatus.CREATE_SNAPSHOT_REJECTION;
    }
}
