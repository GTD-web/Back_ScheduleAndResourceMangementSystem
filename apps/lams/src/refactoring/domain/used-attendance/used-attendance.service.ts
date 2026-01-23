import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository, DataSource } from 'typeorm';
import { UsedAttendance } from './used-attendance.entity';
import { CreateUsedAttendanceData, UpdateUsedAttendanceData, UsedAttendanceDTO } from './used-attendance.types';

/**
 * 사용된 근태 서비스
 *
 * 사용된 근태 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainUsedAttendanceService {
    constructor(
        @InjectRepository(UsedAttendance)
        private readonly repository: Repository<UsedAttendance>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<UsedAttendance> {
        return manager ? manager.getRepository(UsedAttendance) : this.repository;
    }

    /**
     * 사용된 근태를 생성한다
     */
    async 생성한다(data: CreateUsedAttendanceData, manager?: EntityManager): Promise<UsedAttendanceDTO> {
        const repository = this.getRepository(manager);

        // 중복 검증 (직원, 사용 날짜, 근태 유형 조합은 유일해야 함)
        const existing = await repository.findOne({
            where: {
                employee_id: data.employeeId,
                used_at: data.usedAt,
                attendance_type_id: data.attendanceTypeId,
                deleted_at: IsNull(),
            },
        });
        if (existing) {
            throw new ConflictException('이미 해당 날짜에 사용된 근태가 존재합니다.');
        }

        const usedAttendance = new UsedAttendance(data.usedAt, data.employeeId, data.attendanceTypeId);

        const saved = await repository.save(usedAttendance);
        return saved.DTO변환한다();
    }

    /**
     * ID로 사용된 근태를 조회한다
     */
    async ID로조회한다(id: string): Promise<UsedAttendanceDTO> {
        const usedAttendance = await this.repository.findOne({
            where: { id },
            relations: ['employee', 'attendanceType'],
        });
        if (!usedAttendance) {
            throw new NotFoundException(`사용된 근태를 찾을 수 없습니다. (id: ${id})`);
        }
        return usedAttendance.DTO변환한다();
    }

    /**
     * 사용된 근태 목록을 조회한다
     */
    async 목록조회한다(): Promise<UsedAttendanceDTO[]> {
        const usedAttendances = await this.repository.find({
            where: { deleted_at: IsNull() },
            relations: ['employee', 'attendanceType'],
            order: { used_at: 'DESC' },
        });
        return usedAttendances.map((ua) => ua.DTO변환한다());
    }

    /**
     * 특정 직원들의 특정 기간 근태 사용 내역 목록을 조회한다 (근태 유형 포함)
     */
    async 직원ID목록과날짜범위로조회한다(
        employeeIds: string[],
        startDate: string,
        endDate: string,
    ): Promise<UsedAttendanceDTO[]> {
        const usedAttendances = await this.dataSource.manager
            .createQueryBuilder(UsedAttendance, 'ua')
            .leftJoinAndSelect('ua.attendanceType', 'at')
            .where('ua.deleted_at IS NULL')
            .andWhere('ua.employee_id IN (:...employeeIds)', { employeeIds })
            .andWhere('ua.used_at BETWEEN :startDate::text AND :endDate::text', { startDate, endDate })
            .getMany();
        return usedAttendances.map((ua) => ua.DTO변환한다());
    }

    /**
     * 특정 직원의 특정 기간 근태 사용 내역 목록을 조회한다 (근태 유형 포함)
     */
    async 직원ID와날짜범위로조회한다(
        employeeId: string,
        startDate: string,
        endDate: string,
    ): Promise<UsedAttendanceDTO[]> {
        const usedAttendances = await this.dataSource.manager
            .createQueryBuilder(UsedAttendance, 'ua')
            .leftJoinAndSelect('ua.attendanceType', 'at')
            .where('ua.deleted_at IS NULL')
            .andWhere('ua.employee_id = :employeeId', { employeeId })
            .andWhere('ua.used_at BETWEEN :startDate::text AND :endDate::text', { startDate, endDate })
            .getMany();
        return usedAttendances.map((ua) => ua.DTO변환한다());
    }

    /**
     * 사용된 근태 정보를 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateUsedAttendanceData,
        userId: string,
        manager?: EntityManager,
    ): Promise<UsedAttendanceDTO> {
        const repository = this.getRepository(manager);
        const usedAttendance = await repository.findOne({ where: { id } });
        if (!usedAttendance) {
            throw new NotFoundException(`사용된 근태를 찾을 수 없습니다. (id: ${id})`);
        }

        // 중복 검증 (변경 시)
        if (data.usedAt || data.attendanceTypeId) {
            const existing = await repository.findOne({
                where: {
                    employee_id: usedAttendance.employee_id,
                    used_at: data.usedAt || usedAttendance.used_at,
                    attendance_type_id: data.attendanceTypeId || usedAttendance.attendance_type_id,
                    deleted_at: IsNull(),
                },
            });
            if (existing && existing.id !== id) {
                throw new ConflictException('이미 해당 날짜에 사용된 근태가 존재합니다.');
            }
        }

        usedAttendance.업데이트한다(data.usedAt, data.attendanceTypeId);

        // 수정자 정보 설정
        usedAttendance.수정자설정한다(userId);
        usedAttendance.메타데이터업데이트한다(userId);

        const saved = await repository.save(usedAttendance);
        return saved.DTO변환한다();
    }

    /**
     * 사용된 근태를 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const usedAttendance = await repository.findOne({ where: { id } });
        if (!usedAttendance) {
            throw new NotFoundException(`사용된 근태를 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        usedAttendance.deleted_at = new Date();
        // 삭제자 정보 설정
        usedAttendance.수정자설정한다(userId);
        usedAttendance.메타데이터업데이트한다(userId);
        await repository.save(usedAttendance);
    }

    /**
     * 사용된 근태를 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 사용된 근태도 조회할 수 있도록 withDeleted 옵션 사용
        const usedAttendance = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!usedAttendance) {
            throw new NotFoundException(`사용된 근태를 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(usedAttendance);
    }

    /**
     * 날짜 범위로 근태 사용 내역을 조회한다 (근태 유형 포함)
     *
     * @param startDate 시작 날짜 (yyyy-MM-dd 형식)
     * @param endDate 종료 날짜 (yyyy-MM-dd 형식)
     * @param manager 트랜잭션 EntityManager (선택적)
     * @returns 근태 사용 내역 목록
     */
    async 날짜범위로조회한다(startDate: string, endDate: string, manager?: EntityManager): Promise<UsedAttendance[]> {
        const repository = this.getRepository(manager);
        return await repository
            .createQueryBuilder('ua')
            .leftJoinAndSelect('ua.attendanceType', 'at')
            .where('ua.deleted_at IS NULL')
            .andWhere('ua.used_at >= :startDate', { startDate })
            .andWhere('ua.used_at <= :endDate', { endDate })
            .getMany();
    }
}
