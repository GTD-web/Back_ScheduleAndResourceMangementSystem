import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseNotificationEntity } from './base-notification.entity';
import { DataSnapshotApprovalRequestInfoEntity } from '../approval/data-snapshot-approval-request-info.entity';

@ChildEntity()
export class SnapshotApprovalNotificationEntity extends BaseNotificationEntity {
    @Column({ type: 'text' })
    status: string;

    @ManyToOne(() => DataSnapshotApprovalRequestInfoEntity)
    @JoinColumn({ name: 'requestId' })
    approvalRequest: DataSnapshotApprovalRequestInfoEntity;

    read(): void {
        super.read();
    }
}
