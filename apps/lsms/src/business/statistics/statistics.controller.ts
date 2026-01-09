import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { DateUtil } from '../../../libs/utils/date.util';
import { Public } from '../../../libs/decorators/public.decorator';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../libs/interceptors/response.interceptor';
import { ErrorInterceptor } from '../../../libs/interceptors/error.interceptor';

import { StatisticsService } from './statistics.service';
import {
    ConsumableMaintenanceStatsFilterDto,
    ConsumableMaintenanceStatsResponseDto,
    EmployeeReservationStatsFilterDto,
    EmployeeReservationStatsResponseDto,
    ResourceUsageStatsFilterDto,
    ResourceUsageStatsResponseDto,
    StatisticsResponseDto,
    VehicleMaintenanceHistoryFilterDto,
    VehicleMaintenanceHistoryResponseDto,
} from './dtos';

@ApiTags('v2 통계')
@Controller('v2/statistics')
// @Roles(Role.SYSTEM_ADMIN)
@UseInterceptors(ResponseInterceptor, ErrorInterceptor)
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Public()
    @Get('version')
    async getVersion(): Promise<{ version: string; date: string }> {
        return {
            version: '1.0.0',
            date: DateUtil.now().format(),
        };
    }

    @Public()
    @Get('resource-usage-stats')
    @ApiOkResponse({
        description: '자원 사용 통계 조회 성공',
        type: [ResourceUsageStatsResponseDto],
    })
    async getResourceUsageStats(
        @Query() filter: ResourceUsageStatsFilterDto,
    ): Promise<ResourceUsageStatsResponseDto[]> {
        const stats = await this.statisticsService.getResourceUsageStats(filter);
        return stats as unknown as ResourceUsageStatsResponseDto[];
    }

    @Public()
    @Get('vehicle-maintenance-history')
    @ApiOkResponse({
        description: '차량 정비 이력 조회 성공',
        type: [VehicleMaintenanceHistoryResponseDto],
    })
    async getVehicleMaintenanceHistory(
        @Query() filter: VehicleMaintenanceHistoryFilterDto,
    ): Promise<VehicleMaintenanceHistoryResponseDto[]> {
        const history = await this.statisticsService.getVehicleMaintenanceHistory(filter);
        return history as unknown as VehicleMaintenanceHistoryResponseDto[];
    }

    @Public()
    @Get('consumable-maintenance-stats')
    @ApiOkResponse({
        description: '소모품 정비 통계 조회 성공',
        type: [ConsumableMaintenanceStatsResponseDto],
    })
    async getConsumableMaintenanceStats(
        @Query() filter: ConsumableMaintenanceStatsFilterDto,
    ): Promise<ConsumableMaintenanceStatsResponseDto[]> {
        const stats = await this.statisticsService.getConsumableMaintenanceStats(filter);
        return stats as unknown as ConsumableMaintenanceStatsResponseDto[];
    }

    @Public()
    @Get('employee-reservation-stats')
    @ApiOkResponse({
        description: '직원 예약 통계 조회 성공',
        type: [EmployeeReservationStatsResponseDto],
    })
    async getEmployeeReservationStats(
        @Query() filter: EmployeeReservationStatsFilterDto,
    ): Promise<EmployeeReservationStatsResponseDto[]> {
        const stats = await this.statisticsService.getEmployeeReservationStats(filter);
        return stats as unknown as EmployeeReservationStatsResponseDto[];
    }

    @Public()
    @Get('statistics')
    @ApiOkResponse({
        description: '모든 통계 데이터 조회 성공',
        type: StatisticsResponseDto,
    })
    async getAllStatistics(): Promise<StatisticsResponseDto> {
        const [employeeReservationStats, resourceUsageStats, vehicleMaintenanceHistory, consumableMaintenanceStats] =
            await Promise.all([
                this.statisticsService.getEmployeeReservationStats({}),
                this.statisticsService.getResourceUsageStats({}),
                this.statisticsService.getVehicleMaintenanceHistory({}),
                this.statisticsService.getConsumableMaintenanceStats({}),
            ]);

        return {
            employeeReservationStats: employeeReservationStats as unknown as EmployeeReservationStatsResponseDto[],
            resourceUsageStats: resourceUsageStats as unknown as ResourceUsageStatsResponseDto[],
            vehicleMaintenanceHistory: vehicleMaintenanceHistory as unknown as VehicleMaintenanceHistoryResponseDto[],
            consumableMaintenanceStats:
                consumableMaintenanceStats as unknown as ConsumableMaintenanceStatsResponseDto[],
        };
    }
}
