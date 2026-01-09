import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../libs/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../libs/guards/role.guard';
import { ApiDataResponse } from '../../../../libs/decorators/api-responses.decorator';
import { EmplyeesByDepartmentResponseDto } from '../dtos/employees-by-department-response.dto';
import { Roles } from '../../../../libs/decorators/role.decorator';
import { Role } from '../../../../libs/enums/role-type.enum';
import { EmployeeManagementService } from '../employee-management.service';

@ApiTags('v2 직원')
@ApiBearerAuth()
@Controller('v2/employees')
export class EmployeeController {
    constructor(private readonly employeeManagementService: EmployeeManagementService) {}

    @Get('department')
    @ApiOperation({ summary: '부서별 직원 목록 조회 #사용자/참석자설정/모달' })
    @ApiQuery({ name: 'useHiddenInFilter', description: '필터링 조건에서 숨기기 여부', required: false })
    @ApiDataResponse({
        status: 200,
        description: '부서별 직원 목록을 성공적으로 조회했습니다.',
        type: [EmplyeesByDepartmentResponseDto],
    })
    async findAllEmplyeesByDepartment(
        @Query('useHiddenInFilter') useHiddenInFilter?: boolean,
    ): Promise<EmplyeesByDepartmentResponseDto[]> {
        return this.employeeManagementService.findEmployeeList(useHiddenInFilter);
    }

    // 마이그레이션 용 - 2025-09-10
    // @Get('sync-subscription')
    // @ApiOperation({ summary: '구독 정보 동기화' })
    // async syncSubscription(): Promise<void> {
    //     return this.employeeManagementService.syncSubscription();
    // }
}
