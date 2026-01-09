import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DepartmentHierarchyResponseDto } from '../dtos';

@Injectable()
export class DepartmentMicroserviceAdapter {
    private readonly logger = new Logger(DepartmentMicroserviceAdapter.name);
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('SSO_API_URL') || 'https://lsso.vercel.app';
    }

    /**
     * 외부 시스템에서 부서 계층구조 데이터를 가져옵니다
     */
    async fetchDepartmentHierarchy(): Promise<DepartmentHierarchyResponseDto> {
        try {
            this.logger.log('외부 시스템에서 부서 계층구조 데이터를 가져오는 중...');

            const response = await firstValueFrom(
                this.httpService.get<DepartmentHierarchyResponseDto>(
                    `${this.baseUrl}/api/organization/departments/hierarchy`,
                ),
            );

            this.logger.log(`부서 계층구조 데이터 조회 완료: 총 ${response.data.totalDepartments}개 부서`);
            return response.data;
        } catch (error) {
            this.logger.error('부서 계층구조 데이터 조회 실패:', error);
            throw new Error('외부 시스템에서 부서 데이터를 가져오는데 실패했습니다');
        }
    }
}
