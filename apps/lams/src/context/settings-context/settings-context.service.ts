import { Injectable } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import {
    IGetManagerEmployeeListQuery,
    IGetDepartmentListForPermissionQuery,
    IUpdateEmployeeDepartmentPermissionCommand,
    IUpdateEmployeeExtraInfoCommand,
    IGetHolidayListQuery,
    IGetWorkTimeOverrideListQuery,
    IGetAttendanceTypeListQuery,
    IGetManagerEmployeeListResponse,
    IGetDepartmentListForPermissionResponse,
    IGetHolidayListResponse,
    IGetWorkTimeOverrideListResponse,
    IGetAttendanceTypeListResponse,
    IUpdateEmployeeDepartmentPermissionResponse,
    IUpdateEmployeeExtraInfoResponse,
    ICreateHolidayInfoCommand,
    IUpdateHolidayInfoCommand,
    IDeleteHolidayInfoCommand,
    ICreateWorkTimeOverrideCommand,
    IUpdateWorkTimeOverrideCommand,
    IDeleteWorkTimeOverrideCommand,
    ICreateAttendanceTypeCommand,
    IUpdateAttendanceTypeCommand,
    IDeleteAttendanceTypeCommand,
    ICreateHolidayInfoResponse,
    IUpdateHolidayInfoResponse,
    IDeleteHolidayInfoResponse,
    ICreateWorkTimeOverrideResponse,
    IUpdateWorkTimeOverrideResponse,
    IDeleteWorkTimeOverrideResponse,
    ICreateAttendanceTypeResponse,
    IUpdateAttendanceTypeResponse,
    IDeleteAttendanceTypeResponse,
} from './interfaces';
import { GetManagerEmployeeListQuery } from './handlers/employee/queries/get-manager-employee-list.query';
import { GetDepartmentListForPermissionQuery } from './handlers/department/queries/get-department-list-for-permission.query';
import { GetHolidayListQuery } from './handlers/holiday-info/queries/get-holiday-list.query';
import { GetWorkTimeOverrideListQuery } from './handlers/work-time-override/queries/get-work-time-override-list.query';
import { GetAttendanceTypeListQuery } from './handlers/attendance-type/queries/get-attendance-type-list.query';
import { UpdateEmployeeDepartmentPermissionCommand } from './handlers/permission/commands/update-employee-department-permission.command';
import { UpdateEmployeeExtraInfoCommand } from './handlers/employee-extra-info/commands/update-employee-extra-info.command';
import { CreateHolidayInfoCommand } from './handlers/holiday-info/commands/create-holiday-info.command';
import { UpdateHolidayInfoCommand } from './handlers/holiday-info/commands/update-holiday-info.command';
import { DeleteHolidayInfoCommand } from './handlers/holiday-info/commands/delete-holiday-info.command';
import { CreateWorkTimeOverrideCommand } from './handlers/work-time-override/commands/create-work-time-override.command';
import { UpdateWorkTimeOverrideCommand } from './handlers/work-time-override/commands/update-work-time-override.command';
import { DeleteWorkTimeOverrideCommand } from './handlers/work-time-override/commands/delete-work-time-override.command';
import { CreateAttendanceTypeCommand } from './handlers/attendance-type/commands/create-attendance-type.command';
import { UpdateAttendanceTypeCommand } from './handlers/attendance-type/commands/update-attendance-type.command';
import { DeleteAttendanceTypeCommand } from './handlers/attendance-type/commands/delete-attendance-type.command';

/**
 * 설정 관리 Context 서비스
 *
 * 설정 관리 관련 비즈니스 로직을 처리합니다.
 */
@Injectable()
export class SettingsContextService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    /**
     * 관리자 직원 목록을 조회한다
     */
    async 관리자직원목록을조회한다(query: IGetManagerEmployeeListQuery): Promise<IGetManagerEmployeeListResponse> {
        return await this.queryBus.execute(new GetManagerEmployeeListQuery(query));
    }

    /**
     * 권한 관리용 부서 목록을 조회한다
     */
    async 권한관리용부서목록을조회한다(
        query: IGetDepartmentListForPermissionQuery,
    ): Promise<IGetDepartmentListForPermissionResponse> {
        return await this.queryBus.execute(new GetDepartmentListForPermissionQuery(query));
    }

    /**
     * 휴일 목록을 조회한다
     */
    async 휴일목록을조회한다(query: IGetHolidayListQuery): Promise<IGetHolidayListResponse> {
        return await this.queryBus.execute(new GetHolidayListQuery(query));
    }

    /**
     * 특별근태시간 목록을 조회한다
     */
    async 특별근태시간목록을조회한다(query: IGetWorkTimeOverrideListQuery): Promise<IGetWorkTimeOverrideListResponse> {
        return await this.queryBus.execute(new GetWorkTimeOverrideListQuery(query));
    }

    /**
     * 직원-부서 권한을 변경한다
     */
    async 직원부서권한을변경한다(
        command: IUpdateEmployeeDepartmentPermissionCommand,
    ): Promise<IUpdateEmployeeDepartmentPermissionResponse> {
        return await this.commandBus.execute(new UpdateEmployeeDepartmentPermissionCommand(command));
    }

    /**
     * 직원 추가 정보를 변경한다
     */
    async 직원추가정보를변경한다(command: IUpdateEmployeeExtraInfoCommand): Promise<IUpdateEmployeeExtraInfoResponse> {
        return await this.commandBus.execute(new UpdateEmployeeExtraInfoCommand(command));
    }

    /**
     * 휴일 정보를 생성한다
     */
    async 휴일정보를생성한다(command: ICreateHolidayInfoCommand): Promise<ICreateHolidayInfoResponse> {
        return await this.commandBus.execute(new CreateHolidayInfoCommand(command));
    }

    /**
     * 휴일 정보를 수정한다
     */
    async 휴일정보를수정한다(command: IUpdateHolidayInfoCommand): Promise<IUpdateHolidayInfoResponse> {
        return await this.commandBus.execute(new UpdateHolidayInfoCommand(command));
    }

    /**
     * 휴일 정보를 삭제한다
     */
    async 휴일정보를삭제한다(command: IDeleteHolidayInfoCommand): Promise<IDeleteHolidayInfoResponse> {
        return await this.commandBus.execute(new DeleteHolidayInfoCommand(command));
    }

    /**
     * 특별근태시간을 생성한다
     */
    async 특별근태시간을생성한다(command: ICreateWorkTimeOverrideCommand): Promise<ICreateWorkTimeOverrideResponse> {
        return await this.commandBus.execute(new CreateWorkTimeOverrideCommand(command));
    }

    /**
     * 특별근태시간을 수정한다
     */
    async 특별근태시간을수정한다(command: IUpdateWorkTimeOverrideCommand): Promise<IUpdateWorkTimeOverrideResponse> {
        return await this.commandBus.execute(new UpdateWorkTimeOverrideCommand(command));
    }

    /**
     * 특별근태시간을 삭제한다
     */
    async 특별근태시간을삭제한다(command: IDeleteWorkTimeOverrideCommand): Promise<IDeleteWorkTimeOverrideResponse> {
        return await this.commandBus.execute(new DeleteWorkTimeOverrideCommand(command));
    }

    /**
     * 근태유형 목록을 조회한다
     */
    async 근태유형목록을조회한다(query: IGetAttendanceTypeListQuery): Promise<IGetAttendanceTypeListResponse> {
        return await this.queryBus.execute(new GetAttendanceTypeListQuery(query));
    }

    /**
     * 근태유형을 생성한다
     */
    async 근태유형을생성한다(command: ICreateAttendanceTypeCommand): Promise<ICreateAttendanceTypeResponse> {
        return await this.commandBus.execute(new CreateAttendanceTypeCommand(command));
    }

    /**
     * 근태유형을 수정한다
     */
    async 근태유형을수정한다(command: IUpdateAttendanceTypeCommand): Promise<IUpdateAttendanceTypeResponse> {
        return await this.commandBus.execute(new UpdateAttendanceTypeCommand(command));
    }

    /**
     * 근태유형을 삭제한다
     */
    async 근태유형을삭제한다(command: IDeleteAttendanceTypeCommand): Promise<IDeleteAttendanceTypeResponse> {
        return await this.commandBus.execute(new DeleteAttendanceTypeCommand(command));
    }
}
