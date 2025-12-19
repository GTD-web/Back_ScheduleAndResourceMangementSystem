import { Controller, Get, UseInterceptors, Req, Query } from '@nestjs/common';
import { EmployeeManagementService } from '../employee-management.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../libs/decorators/public.decorator';
import { ResponseInterceptor } from '../../../../libs/interceptors/response.interceptor';
import { ErrorInterceptor } from '../../../../libs/interceptors/error.interceptor';

@ApiTags('v2 직원')
@Public()
@Controller('v1/employees')
@UseInterceptors(ResponseInterceptor, ErrorInterceptor)
export class EmployeeWebhookController {
    constructor(private readonly employeeManagementService: EmployeeManagementService) {}

    @Get('sync')
    @ApiOperation({ summary: '직원 동기화' })
    @ApiQuery({ name: 'execute', description: '동기화 실행 여부', required: false })
    // @ApiExcludeEndpoint()
    async syncEmployees(@Req() req: Request, @Query('execute') execute: boolean = false) {
        const authorization = req.headers['authorization'];
        if (execute) {
            return await this.employeeManagementService.syncEmployees(authorization);
        }
        return {
            message: 'execute 파라미터가 없습니다.',
        };
    }
}
