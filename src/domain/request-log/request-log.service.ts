import { Injectable } from '@nestjs/common';
import { BaseService } from '../../../libs/services/base.service';
import { RequestLog, Environment } from '../../../libs/entities/request-log.entity';
import { DomainRequestLogRepository } from './request-log.repository';
import { Between, FindManyOptions, Like, MoreThan } from 'typeorm';

export interface CreateRequestLogData {
    method: string;
    endpoint: string;
    requestBody?: string;
    requestParams?: string;
    requestHeaders?: string;
    responseBody?: string;
    statusCode: number;
    errorMessage?: string;
    errorStack?: string;
    environment: Environment;
    employeeName?: string;
    employeeId?: string;
    userAgent?: string;
    ipAddress?: string;
    duration?: number;
    traceId?: string;
}

export interface RequestLogQuery {
    startDate?: Date;
    endDate?: Date;
    method?: string;
    endpoint?: string;
    employeeId?: string;
    environment?: Environment;
    statusCode?: number;
    traceId?: string;
    page?: number;
    limit?: number;
}

@Injectable()
export class DomainRequestLogService extends BaseService<RequestLog> {
    constructor(private readonly requestLogRepository: DomainRequestLogRepository) {
        super(requestLogRepository);
    }

    /**
     * 요청 로그 생성
     */
    async createRequestLog(data: CreateRequestLogData): Promise<RequestLog> {
        return await this.requestLogRepository.save(data);
    }

    // /**
    //  * 요청 로그 조회 (필터링 포함)
    //  */
    // async findRequestLogs(query: RequestLogQuery): Promise<{ logs: RequestLog[]; total: number }> {
    //     const {
    //         startDate,
    //         endDate,
    //         method,
    //         endpoint,
    //         employeeId,
    //         environment,
    //         statusCode,
    //         traceId,
    //         page = 1,
    //         limit = 50,
    //     } = query;

    //     const where: any = {};

    //     // 날짜 범위 필터
    //     if (startDate && endDate) {
    //         where.requestTime = Between(startDate, endDate);
    //     }

    //     // 메소드 필터
    //     if (method) {
    //         where.method = method;
    //     }

    //     // 엔드포인트 필터 (부분 일치)
    //     if (endpoint) {
    //         where.endpoint = Like(`%${endpoint}%`);
    //     }

    //     // 직원 ID 필터
    //     if (employeeId) {
    //         where.employeeId = employeeId;
    //     }

    //     // 환경 필터
    //     if (environment) {
    //         where.environment = environment;
    //     }

    //     // 상태 코드 필터
    //     if (statusCode) {
    //         where.statusCode = statusCode;
    //     }

    //     // 트레이스 ID 필터
    //     if (traceId) {
    //         where.traceId = traceId;
    //     }

    //     const options: FindManyOptions<RequestLog> = {
    //         where,
    //         order: {
    //             requestTime: 'DESC',
    //         },
    //         take: limit,
    //         skip: (page - 1) * limit,
    //     };

    //     const [logs, total] = await this.requestLogRepository.findAndCount(options);

    //     return { logs, total };
    // }

    // /**
    //  * 트레이스 ID로 요청 로그 조회
    //  */
    // async findByTraceId(traceId: string): Promise<RequestLog | null> {
    //     return await this.requestLogRepository.findOne({
    //         where: { traceId },
    //     });
    // }

    // /**
    //  * 직원별 요청 로그 조회
    //  */
    // async findByEmployeeId(employeeId: string, limit: number = 100): Promise<RequestLog[]> {
    //     return await this.requestLogRepository.findAll({
    //         where: { employeeId },
    //         order: {
    //             requestTime: 'DESC',
    //         },
    //         take: limit,
    //     });
    // }

    // /**
    //  * 에러 로그만 조회
    //  */
    // async findErrorLogs(startDate?: Date, endDate?: Date, limit: number = 100): Promise<RequestLog[]> {
    //     const where: any = {
    //         statusCode: MoreThan(399), // 400 이상은 에러로 간주
    //     };

    //     if (startDate && endDate) {
    //         where.requestTime = Between(startDate, endDate);
    //     }

    //     return await this.requestLogRepository.findAll({
    //         where,
    //         order: {
    //             requestTime: 'DESC',
    //         },
    //         take: limit,
    //     });
    // }

    // /**
    //  * 환경별 통계 조회
    //  */
    // async getEnvironmentStats(
    //     startDate?: Date,
    //     endDate?: Date,
    // ): Promise<Array<{ environment: Environment; count: number; avgDuration: number }>> {
    //     const queryBuilder = this.requestLogRepository.createQueryBuilder('log');

    //     queryBuilder
    //         .select('log.environment', 'environment')
    //         .addSelect('COUNT(*)', 'count')
    //         .addSelect('AVG(log.duration)', 'avgDuration')
    //         .groupBy('log.environment');

    //     if (startDate && endDate) {
    //         queryBuilder.where('log.requestTime BETWEEN :startDate AND :endDate', {
    //             startDate,
    //             endDate,
    //         });
    //     }

    //     return await queryBuilder.getRawMany();
    // }

    // /**
    //  * 응답 시간이 긴 요청들 조회 (성능 모니터링용)
    //  */
    // async findSlowRequests(minDuration: number = 5000, limit: number = 50): Promise<RequestLog[]> {
    //     return await this.requestLogRepository.findAll({
    //         where: {
    //             duration: MoreThan(minDuration),
    //         },
    //         order: {
    //             duration: 'DESC',
    //         },
    //         take: limit,
    //     });
    // }
}
