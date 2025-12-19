import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleDepartment } from '../../../libs/entities/schedule-department.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class ScheduleDepartmentRepository extends BaseRepository<ScheduleDepartment> {
    constructor(
        @InjectRepository(ScheduleDepartment)
        private readonly scheduleDepartmentRepository: Repository<ScheduleDepartment>,
    ) {
        super(scheduleDepartmentRepository);
    }

    /**
     * 특정 일정의 모든 부서 관계를 조회합니다
     */
    async findByScheduleId(scheduleId: string): Promise<ScheduleDepartment[]> {
        return this.scheduleDepartmentRepository.find({
            where: { scheduleId },
            relations: ['department'],
        });
    }

    /**
     * 특정 부서의 모든 일정 관계를 조회합니다
     */
    async findByDepartmentId(departmentId: string): Promise<ScheduleDepartment[]> {
        return this.scheduleDepartmentRepository.find({
            where: { departmentId },
            relations: ['schedule'],
        });
    }

    /**
     * 특정 일정과 부서의 관계를 조회합니다
     */
    async findByScheduleAndDepartment(scheduleId: string, departmentId: string): Promise<ScheduleDepartment | null> {
        return this.scheduleDepartmentRepository.findOne({
            where: { scheduleId, departmentId },
            relations: ['schedule', 'department'],
        });
    }

    /**
     * 특정 일정의 모든 부서 관계를 삭제합니다
     */
    async deleteByScheduleId(scheduleId: string): Promise<void> {
        await this.scheduleDepartmentRepository.delete({ scheduleId });
    }

    /**
     * 특정 부서의 모든 일정 관계를 삭제합니다
     */
    async deleteByDepartmentId(departmentId: string): Promise<void> {
        await this.scheduleDepartmentRepository.delete({ departmentId });
    }
}
