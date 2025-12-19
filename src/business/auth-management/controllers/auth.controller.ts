import { Controller, Post, Body, UseInterceptors, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from '../dtos';
import { AuthManagementService } from '../auth-management.service';
import { Public } from '../../../../libs/decorators/public.decorator';
import { ApiDataResponse } from '../../../../libs/decorators/api-responses.decorator';
import { ResponseInterceptor } from '../../../../libs/interceptors/response.interceptor';
import { ErrorInterceptor } from '../../../../libs/interceptors/error.interceptor';

@ApiTags('v2 인증 관리')
@Controller('v2/auth')
@UseInterceptors(ResponseInterceptor, ErrorInterceptor)
@Public()
export class AuthController {
    constructor(private readonly authManagementService: AuthManagementService) {}

    @Post('login')
    @ApiOperation({ summary: '로그인' })
    @ApiDataResponse({ status: 201, description: '로그인 성공', type: LoginResponseDto })
    login(@Body() loginDto: LoginDto) {
        return this.authManagementService.login(loginDto);
    }
}
