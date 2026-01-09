import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import {
    SSOClient,
    LoginResponse,
    ValidateTokenResponse,
    Employee,
    GetEmployeesResponse,
    ExportAllDataRequest,
    ExportAllDataResponse,
} from '@lumir-company/sso-sdk';
import { SSO_CLIENT } from './sso.constants';

/**
 * SSO 서비스
 *
 * Lumir Company SSO SDK를 NestJS에서 사용하기 위한 서비스입니다.
 * 로그인, 토큰 검증, 조직 정보 조회, FCM 토큰 관리 등의 기능을 제공합니다.
 */
@Injectable()
export class SSOService implements OnModuleInit {
    private readonly logger = new Logger(SSOService.name);

    constructor(@Inject(SSO_CLIENT) private readonly ssoClient: SSOClient) {}

    async onModuleInit() {
        const systemName = this.ssoClient.getSystemName();
        this.logger.log(`SSO 서비스 초기화 완료. 시스템명: ${systemName}`);
    }

    /**
     * 로그인
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        this.logger.debug(`로그인 시도: ${email}`);
        try {
            const result = await this.ssoClient.sso.login(email, password);
            this.logger.log(`로그인 성공: ${email} (${result.employeeNumber})`);
            return result;
        } catch (error) {
            this.logger.error(`로그인 실패: ${email}`, error);
            throw error;
        }
    }

    /**
     * 토큰 검증
     */
    async verifyToken(token: string): Promise<ValidateTokenResponse> {
        try {
            return await this.ssoClient.sso.verifyToken(token);
        } catch (error) {
            this.logger.error('토큰 검증 실패', error);
            throw error;
        }
    }

    /**
     * 토큰 갱신
     */
    async refreshToken(refreshToken: string): Promise<LoginResponse> {
        try {
            return await this.ssoClient.sso.refreshToken(refreshToken);
        } catch (error) {
            this.logger.error('토큰 갱신 실패', error);
            throw error;
        }
    }

    /**
     * 비밀번호 확인
     */
    async checkPassword(token: string, currentPassword: string, email?: string): Promise<boolean> {
        try {
            const result = await this.ssoClient.sso.checkPassword(token, currentPassword, email);
            return result.isValid;
        } catch (error) {
            this.logger.error('비밀번호 확인 실패', error);
            throw error;
        }
    }

    /**
     * 비밀번호 변경
     */
    async changePassword(token: string, newPassword: string): Promise<void> {
        try {
            await this.ssoClient.sso.changePassword(token, newPassword);
            this.logger.log('비밀번호 변경 성공');
        } catch (error) {
            this.logger.error('비밀번호 변경 실패', error);
            throw error;
        }
    }

    /**
     * 직원 정보 조회 (단일)
     */
    async getEmployee(params: {
        employeeId?: string;
        employeeNumber?: string;
        withDetail?: boolean;
    }): Promise<Employee> {
        try {
            return await this.ssoClient.organization.getEmployee(params);
        } catch (error) {
            this.logger.error('직원 정보 조회 실패', error);
            throw error;
        }
    }

    /**
     * 직원 정보 조회 (다수)
     */
    async getEmployees(params?: {
        identifiers?: string[];
        withDetail?: boolean;
        includeTerminated?: boolean;
    }): Promise<GetEmployeesResponse> {
        try {
            return await this.ssoClient.organization.getEmployees(params);
        } catch (error) {
            this.logger.error('직원 목록 조회 실패', error);
            throw error;
        }
    }

    /**
     * 부서 계층구조 조회
     */
    async getDepartmentHierarchy(params?: {
        rootDepartmentId?: string;
        maxDepth?: number;
        withEmployeeDetail?: boolean;
        includeTerminated?: boolean;
        includeEmptyDepartments?: boolean;
    }) {
        try {
            return await this.ssoClient.organization.getDepartmentHierarchy(params);
        } catch (error) {
            this.logger.error('부서 계층구조 조회 실패', error);
            throw error;
        }
    }

    /**
     * 직원들의 매니저 정보 조회
     */
    async getEmployeesManagers() {
        try {
            return await this.ssoClient.organization.getEmployeesManagers();
        } catch (error) {
            this.logger.error('매니저 정보 조회 실패', error);
            throw error;
        }
    }

    /**
     * FCM 토큰 구독 (앱 로그인 시)
     */
    async subscribeFcm(params: { employeeId?: string; employeeNumber?: string; fcmToken: string; deviceType: string }) {
        try {
            return await this.ssoClient.fcm.subscribe(params);
        } catch (error) {
            this.logger.error('FCM 토큰 구독 실패', error);
            throw error;
        }
    }

    /**
     * FCM 토큰 조회
     */
    async getFcmToken(params: { employeeId?: string; employeeNumber?: string }) {
        try {
            return await this.ssoClient.fcm.getToken(params);
        } catch (error) {
            this.logger.error('FCM 토큰 조회 실패', error);
            throw error;
        }
    }

    /**
     * 여러 직원의 FCM 토큰 조회 (알림서버용)
     */
    async getMultipleFcmTokens(params: { employeeIds?: string[]; employeeNumbers?: string[] }) {
        try {
            return await this.ssoClient.fcm.getMultipleTokens(params);
        } catch (error) {
            this.logger.error('다중 FCM 토큰 조회 실패', error);
            throw error;
        }
    }

    /**
     * FCM 토큰 구독 해지 (앱 로그아웃 시)
     */
    async unsubscribeFcm(params: { employeeId?: string; employeeNumber?: string }) {
        try {
            return await this.ssoClient.fcm.unsubscribe(params);
        } catch (error) {
            this.logger.error('FCM 토큰 구독 해지 실패', error);
            throw error;
        }
    }

    /**
     * 모든 조직 데이터 내보내기
     *
     * 부서, 직원, 직급, 계급, 직원-부서-직급 배정, 배정 이력 등의 모든 조직 데이터를 조회합니다.
     */
    async exportAllData(params?: ExportAllDataRequest): Promise<ExportAllDataResponse> {
        try {
            this.logger.debug(`모든 조직 데이터 내보내기 시작: ${JSON.stringify(params)}`);
            const result = await this.ssoClient.organization.exportAllData(params);
            this.logger.log(
                `모든 조직 데이터 내보내기 완료: 부서 ${result.totalCounts.departments}개, 직원 ${result.totalCounts.employees}명, 직급 ${result.totalCounts.positions}개, 계급 ${result.totalCounts.ranks}개`,
            );
            return result;
        } catch (error) {
            this.logger.error('모든 조직 데이터 내보내기 실패', error);
            throw error;
        }
    }
}
