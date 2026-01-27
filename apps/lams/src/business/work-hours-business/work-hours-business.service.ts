import { Injectable, Logger } from '@nestjs/common';
import { WorkHoursContextService } from '../../context/work-hours-context/work-hours-context.service';
import {
    IGetWorkScheduleTypeQuery,
    IGetMonthlyWorkHoursQuery,
    IGetProjectListQuery,
    IAssignProjectCommand,
    IRemoveProjectAssignmentCommand,
    ICreateWorkHoursCommand,
    IDeleteWorkHoursByDateCommand,
} from '../../context/work-hours-context/interfaces';
import { WorkScheduleTypeDTO } from '../../domain/work-schedule-type/work-schedule-type.types';
import { AssignedProjectDTO } from '../../domain/assigned-project/assigned-project.types';
import { WorkHoursDTO } from '../../domain/work-hours/work-hours.types';

/**
 * 시수 비즈니스 서비스
 *
 * 시수 관련 비즈니스 로직을 오케스트레이션합니다.
 */
@Injectable()
export class WorkHoursBusinessService {
    private readonly logger = new Logger(WorkHoursBusinessService.name);

    constructor(private readonly workHoursContextService: WorkHoursContextService) {}

    /**
     * 현재 적용 중인 근무 유형을 조회한다
     * 요청 시간을 통해 현재 어떤 유형을 응답해야하는지 판별
     */
    async 현재근무유형조회한다(date?: string): Promise<WorkScheduleTypeDTO | null> {
        this.logger.log(`현재 근무 유형 조회: date=${date || '오늘'}`);
        const query: IGetWorkScheduleTypeQuery = { date };
        const result = await this.workHoursContextService.현재근무유형조회한다(query);
        return result.scheduleType;
    }

    /**
     * 직원에 프로젝트를 할당한다
     */
    async 프로젝트할당한다(
        employeeId: string,
        projectId: string,
        startDate?: string,
        endDate?: string,
        performedBy?: string,
    ): Promise<AssignedProjectDTO> {
        this.logger.log(`프로젝트 할당: employeeId=${employeeId}, projectId=${projectId}`);
        const command: IAssignProjectCommand = {
            employeeId,
            projectId,
            startDate,
            endDate,
            performedBy: performedBy || 'system',
        };
        const result = await this.workHoursContextService.프로젝트할당한다(command);
        return result.assignedProject;
    }

    /**
     * 직원의 프로젝트 할당을 제거한다
     */
    async 프로젝트할당제거한다(assignedProjectId: string, userId: string): Promise<void> {
        this.logger.log(`프로젝트 할당 제거: assignedProjectId=${assignedProjectId}`);
        const command: IRemoveProjectAssignmentCommand = {
            assignedProjectId,
            performedBy: userId,
        };
        await this.workHoursContextService.프로젝트할당제거한다(command);
    }

    /**
     * 시수를 입력한다
     */
    async 시수입력한다(
        assignedProjectId: string,
        date: string,
        startTime?: string,
        endTime?: string,
        workMinutes?: number,
        note?: string,
        userId?: string,
    ): Promise<WorkHoursDTO> {
        this.logger.log(`시수 입력: assignedProjectId=${assignedProjectId}, date=${date}`);
        const command: ICreateWorkHoursCommand = {
            assignedProjectId,
            date,
            startTime,
            endTime,
            workMinutes,
            note,
            performedBy: userId,
        };
        const result = await this.workHoursContextService.시수입력한다(command);
        return result.workHours;
    }

    /**
     * 해당 날짜의 모든 시수를 삭제한다
     */
    async 날짜별시수삭제한다(date: string, userId: string): Promise<void> {
        this.logger.log(`날짜별 시수 삭제: date=${date}`);
        const command: IDeleteWorkHoursByDateCommand = {
            date,
            performedBy: userId,
        };
        await this.workHoursContextService.날짜별시수삭제한다(command);
    }

    /**
     * 월별 시수 현황을 조회한다
     */
    async 월별시수현황조회한다(employeeId: string, year: string, month: string): Promise<{
        employeeId: string;
        year: string;
        month: string;
        workHours: Array<{
            projectId: string;
            projectName: string;
            projectCode: string;
            date: string;
            startTime: string | null;
            endTime: string | null;
            workMinutes: number;
            note: string | null;
        }>;
        totalWorkMinutes: number;
    }> {
        this.logger.log(`월별 시수 현황 조회: employeeId=${employeeId}, year=${year}, month=${month}`);
        const query: IGetMonthlyWorkHoursQuery = {
            employeeId,
            year,
            month,
        };
        return await this.workHoursContextService.월별시수현황조회한다(query);
    }

    /**
     * 프로젝트 목록을 조회한다
     */
    async 프로젝트목록조회한다(): Promise<{
        projects: Array<{
            id: string;
            projectCode: string;
            projectName: string;
            description: string | null;
            isActive: boolean;
        }>;
        totalCount: number;
    }> {
        this.logger.log('프로젝트 목록 조회');
        const query: IGetProjectListQuery = {};
        return await this.workHoursContextService.프로젝트목록조회한다(query);
    }
}
