import { Injectable } from '@nestjs/common';
import { DomainUsedAttendanceRepository } from './used-attendance.repository';
import { BaseService } from '../../../common/services/base.service';
import { UsedAttendance } from './used-attendance.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class DomainUsedAttendanceService extends BaseService<UsedAttendance> {
    constructor(
        private readonly usedAttendanceRepository: DomainUsedAttendanceRepository,
        private readonly dataSource: DataSource,
    ) {
        super(usedAttendanceRepository);
    }

    /**
     * 특정 직원들의 특정 기간 근태 사용 내역 조회 (근태 유형 포함)
     */
    async findByEmployeeIdsAndDateRange(
        employeeIds: string[],
        startDate: string,
        endDate: string,
    ): Promise<UsedAttendance[]> {
        return this.dataSource.manager
            .createQueryBuilder(UsedAttendance, 'ua')
            .leftJoinAndSelect('ua.attendanceType', 'at')
            .where('ua."employeeId" IN (:...employeeIds)', { employeeIds })
            .andWhere('ua."usedAt" BETWEEN :startDate::text AND :endDate::text', { startDate, endDate })
            .getMany();
    }

    /**
     * 특정 직원의 특정 기간 근태 사용 내역 조회 (근태 유형 포함)
     */
    async findByEmployeeIdAndDateRange(
        employeeId: string,
        startDate: string,
        endDate: string,
    ): Promise<UsedAttendance[]> {
        return this.dataSource.manager
            .createQueryBuilder(UsedAttendance, 'ua')
            .leftJoinAndSelect('ua.attendanceType', 'at')
            .where('ua."employeeId" = :employeeId', { employeeId })
            .andWhere('ua."usedAt" BETWEEN :startDate::text AND :endDate::text', { startDate, endDate })
            .getMany();
    }
}

