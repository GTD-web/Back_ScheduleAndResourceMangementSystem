import { AfterLoad, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LamsUserEntity } from '../user/lams-user.entity';
import { ApprovalRequestBaseInfoEntity } from './approval-request-info.entity';

export enum ApprovalHistoryAction {
    APPROVE = '승인',
    REJECT = '반려',
    CANCEL = '취소',
    REQUEST = '요청',
}

@Entity()
export class ApprovalHistoryInfoEntity {
    @PrimaryGeneratedColumn('uuid')
    historyId: string;

    @Column({ length: 20 })
    action: ApprovalHistoryAction;

    @ManyToOne(() => LamsUserEntity)
    actionBy: LamsUserEntity;

    @ManyToOne(() => ApprovalRequestBaseInfoEntity)
    request: ApprovalRequestBaseInfoEntity;

    @CreateDateColumn()
    actionAt: Date;

    @Column('text', { nullable: true })
    comments: string;

    @AfterLoad()
    afterLoad() {
        this.actionAt = new Date(new Date(this.actionAt).toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    }
}
