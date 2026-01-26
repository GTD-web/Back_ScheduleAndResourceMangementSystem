import { Controller, Post, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../../libs/decorators/public.decorator';
import { GenerateTokenRequestDto, GenerateTokenResponseDto } from './dto/generate-token.dto';
import { VerifyTokenRequestDto, VerifyTokenResponseDto } from './dto/verify-token.dto';
import { MigrateOrganizationRequestDto, MigrateOrganizationResponseDto } from './dto/migrate-organization.dto';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import { OrganizationMigrationService } from '../../integrations/migration/migration.service';
import { SSOService } from '@libs/integrations/sso';

/**
 * 인증 컨트롤러
 *
 * JWT 토큰 생성 및 검증 API를 제공합니다.
 */
@ApiTags('인증')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly migrationService: OrganizationMigrationService,
        private readonly ssoService: SSOService,
    ) {}

    /**
     * SSO 로그인
     *
     * SSO를 통해 로그인하고 JWT 토큰을 발급합니다.
     */
    @Public()
    @Post('login')
    @ApiOperation({
        summary: 'SSO 로그인',
        description: 'SSO를 통해 로그인하고 JWT 토큰을 발급합니다.',
    })
    async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
        try {
            // SSO 로그인
            const ssoResponse = await this.ssoService.login(dto.email, dto.password);

            // SSO 응답에서 직원 번호 추출
            if (!ssoResponse.employeeNumber) {
                throw new UnauthorizedException('SSO 로그인 응답에 직원 번호가 없습니다.');
            }

            // SSO를 통해 직원 상세 정보 조회
            const employee = await this.ssoService.getEmployee({
                employeeNumber: ssoResponse.employeeNumber,
                withDetail: true,
            });

            // JWT 토큰 생성
            const jwtPayload = {
                id: employee.id,
                employeeNumber: employee.employeeNumber,
                name: employee.name,
                email: employee.email,
            };

            const token = this.jwtService.sign(jwtPayload);

            return {
                success: true,
                token,
                user: {
                    id: employee.id,
                    employeeNumber: employee.employeeNumber,
                    name: employee.name,
                    email: employee.email,
                },
                ssoToken: {
                    accessToken: ssoResponse.accessToken,
                    refreshToken: ssoResponse.refreshToken,
                },
            };
        } catch (error: any) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException(`로그인 실패: ${error.message || '알 수 없는 오류'}`);
        }
    }

    /**
     * JWT 토큰 생성
     *
     * 만료시간 없이 유효한 JWT 토큰을 생성합니다.
     */
    @Public()
    @Post('generate-token')
    @ApiOperation({
        summary: 'JWT 토큰 생성',
        description: '만료시간 없이 유효한 JWT 토큰을 생성합니다.',
    })
    async generateToken(@Body() dto: GenerateTokenRequestDto): Promise<GenerateTokenResponseDto> {
        try {
            const payload: any = {
                id: '839e6f06-8d44-43a1-948c-095253c4cf8c',
                employeeNumber: '24016',
                name: '김규현',
                email: 'kim.kyuhyun@lumir.space',
            };

            // 만료시간 없이 토큰 생성
            // JwtService.sign()은 JwtModule에 등록된 secret을 사용하므로 별도로 secret을 지정하지 않음
            // JwtModule의 기본 signOptions에 expiresIn이 있으면 override해야 함
            const token = this.jwtService.sign(payload);

            return {
                success: true,
                token,
                tokenInfo: {
                    employeeNumber: '24016',
                    name: '김규현',
                    email: 'kim.kyuhyun@lumir.space',
                    issuedAt: new Date(),
                    expiresAt: undefined, // 만료시간 없음
                },
                usage: `Authorization: Bearer ${token}`,
            };
        } catch (error) {
            throw new BadRequestException(`토큰 생성 실패: ${error.message}`);
        }
    }

    /**
     * JWT 토큰 검증
     *
     * JWT 토큰의 유효성을 검증하고 payload를 반환합니다.
     */
    @Public()
    @Post('verify-token')
    @ApiOperation({
        summary: 'JWT 토큰 검증',
        description: 'JWT 토큰의 유효성을 검증하고 payload를 반환합니다.',
    })
    async verifyToken(@Body() dto: VerifyTokenRequestDto): Promise<VerifyTokenResponseDto> {
        try {
            const secret =
                this.configService.get<string>('GLOBAL_SECRET') || this.configService.get<string>('jwt.secret');

            if (!secret) {
                throw new BadRequestException('JWT 시크릿이 설정되지 않았습니다.');
            }

            // 토큰 검증
            const payload = this.jwtService.verify(dto.token, {
                secret,
            });

            return {
                valid: true,
                payload: {
                    id: payload.id,
                    employeeNumber: payload.employeeNumber,
                    name: payload.name,
                    email: payload.email,
                    iat: payload.iat,
                    exp: payload.exp,
                    ...payload,
                },
            };
        } catch (error: any) {
            // 토큰 만료 오류
            if (error.name === 'TokenExpiredError') {
                return {
                    valid: false,
                    expired: true,
                    error: '토큰이 만료되었습니다.',
                };
            }

            // 토큰 형식 오류
            if (error.name === 'JsonWebTokenError') {
                return {
                    valid: false,
                    error: '유효하지 않은 토큰입니다.',
                };
            }

            // 기타 오류
            return {
                valid: false,
                error: error.message || '토큰 검증 중 오류가 발생했습니다.',
            };
        }
    }

    /**
     * 조직 데이터 마이그레이션
     *
     * SSO에서 모든 조직 데이터를 가져와서 로컬 데이터베이스에 동기화합니다.
     */
    @Public()
    @Post('migrate-organization')
    @ApiOperation({
        summary: '조직 데이터 마이그레이션',
        description: 'SSO에서 모든 조직 데이터를 가져와서 로컬 데이터베이스에 동기화합니다.',
    })
    async migrateOrganization(@Body() dto: MigrateOrganizationRequestDto): Promise<MigrateOrganizationResponseDto> {
        try {
            const result = await this.migrationService.마이그레이션한다({
                includeTerminated: dto.includeTerminated,
                includeInactiveDepartments: dto.includeInactiveDepartments,
            });

            return result;
        } catch (error: any) {
            throw new BadRequestException(`마이그레이션 실패: ${error.message}`);
        }
    }
}
