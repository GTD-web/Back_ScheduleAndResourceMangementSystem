import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ScheduleDepartment } from './schedule-department.entity';
import { BaseService } from '../../../libs/services/base.service';
import { ScheduleDepartmentRepository } from './schedule-department.repository';
import {
    ScheduleDepartmentCreateRequestDto,
    ScheduleDepartmentResponseDto,
    ScheduleDepartmentWithDetailsResponseDto,
} from './dtos';

@Injectable()
export class DomainScheduleDepartmentService extends BaseService<ScheduleDepartment> {
    private readonly logger = new Logger(DomainScheduleDepartmentService.name);

    constructor(private readonly scheduleDepartmentRepository: ScheduleDepartmentRepository) {
        super(scheduleDepartmentRepository);
    }

    /**
     * 일정-부서 관계를 생성합니다
     */
    async createScheduleDepartment(
        createDto: ScheduleDepartmentCreateRequestDto,
    ): Promise<ScheduleDepartmentResponseDto> {
        try {
            // 중복 관계 확인
            const existingRelation = await this.scheduleDepartmentRepository.findByScheduleAndDepartment(
                createDto.scheduleId,
                createDto.departmentId,
            );

            if (existingRelation) {
                this.logger.warn(
                    `일정-부서 관계가 이미 존재합니다: Schedule ${createDto.scheduleId}, Department ${createDto.departmentId}`,
                );
                return this.toResponseDto(existingRelation);
            }

            const scheduleDepartment = await this.create(createDto);
            const savedRelation = await this.save(scheduleDepartment);

            this.logger.log(
                `일정-부서 관계 생성 완료: Schedule ${createDto.scheduleId}, Department ${createDto.departmentId}`,
            );

            return this.toResponseDto(savedRelation);
        } catch (error) {
            this.logger.error(
                `일정-부서 관계 생성 실패: Schedule ${createDto.scheduleId}, Department ${createDto.departmentId}`,
                error,
            );
            throw error;
        }
    }

    /**
     * 특정 일정의 모든 부서 관계를 조회합니다
     */
    async findDepartmentsByScheduleId(scheduleId: string): Promise<ScheduleDepartmentWithDetailsResponseDto[]> {
        try {
            const relations = await this.scheduleDepartmentRepository.findByScheduleId(scheduleId);

            return relations.map((relation) => ({
                scheduleDepartmentId: relation.scheduleDepartmentId,
                scheduleId: relation.scheduleId,
                departmentId: relation.departmentId,
                departmentName: relation.department?.departmentName || '',
                createdAt: relation.createdAt,
            }));
        } catch (error) {
            this.logger.error(`일정의 부서 관계 조회 실패: Schedule ${scheduleId}`, error);
            throw error;
        }
    }

    /**
     * 특정 부서의 모든 일정 관계를 조회합니다
     */
    async findSchedulesByDepartmentId(departmentId: string): Promise<ScheduleDepartmentResponseDto[]> {
        try {
            const relations = await this.scheduleDepartmentRepository.findByDepartmentId(departmentId);

            return relations.map((relation) => this.toResponseDto(relation));
        } catch (error) {
            this.logger.error(`부서의 일정 관계 조회 실패: Department ${departmentId}`, error);
            throw error;
        }
    }

    /**
     * 일정-부서 관계를 삭제합니다
     */
    async deleteScheduleDepartment(scheduleId: string, departmentId: string): Promise<void> {
        try {
            const relation = await this.scheduleDepartmentRepository.findByScheduleAndDepartment(
                scheduleId,
                departmentId,
            );

            if (!relation) {
                throw new NotFoundException(
                    `일정-부서 관계를 찾을 수 없습니다: Schedule ${scheduleId}, Department ${departmentId}`,
                );
            }

            await this.scheduleDepartmentRepository.delete(relation.scheduleDepartmentId);

            this.logger.log(`일정-부서 관계 삭제 완료: Schedule ${scheduleId}, Department ${departmentId}`);
        } catch (error) {
            this.logger.error(`일정-부서 관계 삭제 실패: Schedule ${scheduleId}, Department ${departmentId}`, error);
            throw error;
        }
    }

    /**
     * 특정 일정의 모든 부서 관계를 삭제합니다
     */
    async deleteAllDepartmentsByScheduleId(scheduleId: string): Promise<void> {
        try {
            await this.scheduleDepartmentRepository.deleteByScheduleId(scheduleId);
            this.logger.log(`일정의 모든 부서 관계 삭제 완료: Schedule ${scheduleId}`);
        } catch (error) {
            this.logger.error(`일정의 모든 부서 관계 삭제 실패: Schedule ${scheduleId}`, error);
            throw error;
        }
    }

    /**
     * 특정 부서의 모든 일정 관계를 삭제합니다
     */
    async deleteAllSchedulesByDepartmentId(departmentId: string): Promise<void> {
        try {
            await this.scheduleDepartmentRepository.deleteByDepartmentId(departmentId);
            this.logger.log(`부서의 모든 일정 관계 삭제 완료: Department ${departmentId}`);
        } catch (error) {
            this.logger.error(`부서의 모든 일정 관계 삭제 실패: Department ${departmentId}`, error);
            throw error;
        }
    }

    /**
     * 일정의 부서 관계를 일괄 업데이트합니다 (기존 관계 삭제 후 새로운 관계 생성)
     */
    async updateScheduleDepartments(
        scheduleId: string,
        departmentIds: string[],
    ): Promise<ScheduleDepartmentResponseDto[]> {
        try {
            // 기존 관계 모두 삭제
            await this.deleteAllDepartmentsByScheduleId(scheduleId);

            // 새로운 관계 생성
            const results: ScheduleDepartmentResponseDto[] = [];
            for (const departmentId of departmentIds) {
                const relation = await this.createScheduleDepartment({
                    scheduleId,
                    departmentId,
                });
                results.push(relation);
            }

            this.logger.log(
                `일정의 부서 관계 일괄 업데이트 완료: Schedule ${scheduleId}, Departments [${departmentIds.join(', ')}]`,
            );

            return results;
        } catch (error) {
            this.logger.error(`일정의 부서 관계 일괄 업데이트 실패: Schedule ${scheduleId}`, error);
            throw error;
        }
    }

    /**
     * 엔티티를 ResponseDto로 변환합니다
     */
    private toResponseDto(scheduleDepartment: ScheduleDepartment): ScheduleDepartmentResponseDto {
        return {
            scheduleDepartmentId: scheduleDepartment.scheduleDepartmentId,
            scheduleId: scheduleDepartment.scheduleId,
            departmentId: scheduleDepartment.departmentId,
            createdAt: scheduleDepartment.createdAt,
        };
    }
}
