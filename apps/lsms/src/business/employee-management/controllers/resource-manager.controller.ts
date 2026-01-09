import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../libs/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../libs/guards/role.guard';
import { ApiDataResponse } from '../../../../libs/decorators/api-responses.decorator';
import { Role } from '../../../../libs/enums/role-type.enum';
import { Roles } from '../../../../libs/decorators/role.decorator';
import { EmployeeManagementService } from '../employee-management.service';
import { EmplyeesByDepartmentResponseDto } from '../dtos/employees-by-department-response.dto';

@ApiTags('v2 자원 관리자')
@ApiBearerAuth()
@Controller('v2/resource-managers')
export class ResourceManagerController {
    constructor(private readonly employeeManagementService: EmployeeManagementService) {}

    @Get()
    @ApiOperation({ summary: '자원 관리자 목록 조회' })
    @ApiDataResponse({
        status: 200,
        description: '자원 관리자 목록 조회 성공',
        type: [EmplyeesByDepartmentResponseDto],
    })
    async findAllResourceManagers(): Promise<EmplyeesByDepartmentResponseDto[]> {
        return this.employeeManagementService.findResourceManagers();
    }
}
