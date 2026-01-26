import { BeforeInsert, BeforeUpdate, ChildEntity, Column } from 'typeorm';
import { UserEntity } from './user.entity';

export enum LrimUserRole {
    ADMIN = 'LRIM_ADMIN',
    USER = 'LRIM_USER',
}

@ChildEntity()
export class LrimUserEntity extends UserEntity {
    constructor() {
        super();
    }

    @Column()
    mongoId: string;

    @Column({ default: false })
    isEvaluator: boolean;

    @Column({ default: false })
    isInterviewer: boolean;

    @Column({ default: false })
    isRequiredNotifier: boolean;

    setIsRequiredNotifier(isRequiredNotifier: boolean) {
        this.isRequiredNotifier = isRequiredNotifier;
    }

    setIsInterviewer(isInterviewer: boolean) {
        this.isInterviewer = isInterviewer;
    }

    setIsEvaluator(isEvaluator: boolean) {
        this.isEvaluator = isEvaluator;
    }

    setLrimRoles(role: LrimUserRole) {
        // 기존 역할 제거
        this.roles = this.roles.filter((r) => r !== LrimUserRole.ADMIN && r !== LrimUserRole.USER);

        // 새로운 역할 추가
        this.roles.push(role);
    }
}
