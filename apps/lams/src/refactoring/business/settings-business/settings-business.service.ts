import { Injectable } from '@nestjs/common';
import { SettingsContextService } from '../../context/settings-context/settings-context.service';
import {
    IGetManagerEmployeeListQuery,
    IGetDepartmentListForPermissionQuery,
    IGetHolidayListQuery,
    IGetWorkTimeOverrideListQuery,
    IGetAttendanceTypeListQuery,
    IGetManagerEmployeeListResponse,
    IGetDepartmentListForPermissionResponse,
    IGetHolidayListResponse,
    IGetWorkTimeOverrideListResponse,
    IGetAttendanceTypeListResponse,
    IUpdateEmployeeDepartmentPermissionCommand,
    IUpdateEmployeeExtraInfoCommand,
    ICreateHolidayInfoCommand,
    IUpdateHolidayInfoCommand,
    IDeleteHolidayInfoCommand,
    ICreateWorkTimeOverrideCommand,
    IUpdateWorkTimeOverrideCommand,
    IDeleteWorkTimeOverrideCommand,
    ICreateAttendanceTypeCommand,
    IUpdateAttendanceTypeCommand,
    IDeleteAttendanceTypeCommand,
    IUpdateEmployeeDepartmentPermissionResponse,
    IUpdateEmployeeExtraInfoResponse,
    ICreateHolidayInfoResponse,
    IUpdateHolidayInfoResponse,
    IDeleteHolidayInfoResponse,
    ICreateWorkTimeOverrideResponse,
    IUpdateWorkTimeOverrideResponse,
    IDeleteWorkTimeOverrideResponse,
    ICreateAttendanceTypeResponse,
    IUpdateAttendanceTypeResponse,
    IDeleteAttendanceTypeResponse,
} from '../../context/settings-context/interfaces';

/**
 * 설정 관리 Business 서비스
 *
 * 설정 관리 관련 비즈니스 로직을 조합합니다.
 */
@Injectable()
export class SettingsBusinessService {
    constructor(private readonly settingsContextService: SettingsContextService) {}

    /**
     * 관리자 직원 목록을 조회한다
     */
    async 관리자직원목록을조회한다(query: IGetManagerEmployeeListQuery): Promise<IGetManagerEmployeeListResponse> {
        return await this.settingsContextService.관리자직원목록을조회한다(query);
    }

    /**
     * 권한 관리용 부서 목록을 조회한다
     */
    async 권한관리용부서목록을조회한다(
        query: IGetDepartmentListForPermissionQuery,
    ): Promise<IGetDepartmentListForPermissionResponse> {
        return await this.settingsContextService.권한관리용부서목록을조회한다(query);
    }

    /**
     * 휴일 목록을 조회한다
     */
    async 휴일목록을조회한다(query: IGetHolidayListQuery): Promise<IGetHolidayListResponse> {
        return await this.settingsContextService.휴일목록을조회한다(query);
    }

    /**
     * 특별근태시간 목록을 조회한다
     */
    async 특별근태시간목록을조회한다(
        query: IGetWorkTimeOverrideListQuery,
    ): Promise<IGetWorkTimeOverrideListResponse> {
        return await this.settingsContextService.특별근태시간목록을조회한다(query);
    }

    /**
     * 직원-부서 권한을 변경한다
     */
    async 직원부서권한을변경한다(
        command: IUpdateEmployeeDepartmentPermissionCommand,
    ): Promise<IUpdateEmployeeDepartmentPermissionResponse> {
        return await this.settingsContextService.직원부서권한을변경한다(command);
    }

    /**
     * 직원 추가 정보를 변경한다
     */
    async 직원추가정보를변경한다(
        command: IUpdateEmployeeExtraInfoCommand,
    ): Promise<IUpdateEmployeeExtraInfoResponse> {
        return await this.settingsContextService.직원추가정보를변경한다(command);
    }

    /**
     * 휴일 정보를 생성한다
     */
    async 휴일정보를생성한다(command: ICreateHolidayInfoCommand): Promise<ICreateHolidayInfoResponse> {
        return await this.settingsContextService.휴일정보를생성한다(command);
    }

    /**
     * 휴일 정보를 수정한다
     */
    async 휴일정보를수정한다(command: IUpdateHolidayInfoCommand): Promise<IUpdateHolidayInfoResponse> {
        return await this.settingsContextService.휴일정보를수정한다(command);
    }

    /**
     * 휴일 정보를 삭제한다
     */
    async 휴일정보를삭제한다(command: IDeleteHolidayInfoCommand): Promise<IDeleteHolidayInfoResponse> {
        return await this.settingsContextService.휴일정보를삭제한다(command);
    }

    /**
     * 특별근태시간을 생성한다
     */
    async 특별근태시간을생성한다(
        command: ICreateWorkTimeOverrideCommand,
    ): Promise<ICreateWorkTimeOverrideResponse> {
        return await this.settingsContextService.특별근태시간을생성한다(command);
    }

    /**
     * 특별근태시간을 수정한다
     */
    async 특별근태시간을수정한다(
        command: IUpdateWorkTimeOverrideCommand,
    ): Promise<IUpdateWorkTimeOverrideResponse> {
        return await this.settingsContextService.특별근태시간을수정한다(command);
    }

    /**
     * 특별근태시간을 삭제한다
     */
    async 특별근태시간을삭제한다(
        command: IDeleteWorkTimeOverrideCommand,
    ): Promise<IDeleteWorkTimeOverrideResponse> {
        return await this.settingsContextService.특별근태시간을삭제한다(command);
    }

    /**
     * 근태유형 목록을 조회한다
     */
    async 근태유형목록을조회한다(query: IGetAttendanceTypeListQuery): Promise<IGetAttendanceTypeListResponse> {
        return await this.settingsContextService.근태유형목록을조회한다(query);
    }

    /**
     * 근태유형을 생성한다
     */
    async 근태유형을생성한다(command: ICreateAttendanceTypeCommand): Promise<ICreateAttendanceTypeResponse> {
        return await this.settingsContextService.근태유형을생성한다(command);
    }

    /**
     * 근태유형을 수정한다
     */
    async 근태유형을수정한다(command: IUpdateAttendanceTypeCommand): Promise<IUpdateAttendanceTypeResponse> {
        return await this.settingsContextService.근태유형을수정한다(command);
    }

    /**
     * 근태유형을 삭제한다
     */
    async 근태유형을삭제한다(command: IDeleteAttendanceTypeCommand): Promise<IDeleteAttendanceTypeResponse> {
        return await this.settingsContextService.근태유형을삭제한다(command);
    }
}
