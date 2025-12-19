// node_modules
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

// 프로젝트 내부 라이브러리
import { typeOrmConfig } from '../libs/configs/typeorm.config';
import databaseConfig, { JWT_CONFIG } from '../libs/configs/env.config';
import { jwtConfig } from '../libs/configs/jwt.config';
import { Entities } from '../libs/entities';

import { FileManagementModule } from './business/file-management/file-management.module';
import { ResourceManagementModule } from './business/resource-management/resource-management.module';
import { ReservationManagementModule } from './business/reservation-management/reservation-management.module';
import { ScheduleManagementModule } from './business/schedule-management/schedule-management.module';
import { EmployeeManagementModule } from './business/employee-management/employee-management.module';
import { TaskManagementModule } from './business/task-management/task-management.module';
import { NotificationManagementModule } from './business/notification-management/notification-management.module';
import { StatisticsModule } from './business/statistics/statistics.module';
import { AuthManagementModule } from './business/auth-management/auth-management.module';
import { DomainRequestLogModule } from './domain/request-log/request-log.module';
import { RequestInterceptor } from '../libs/interceptors/request.interceptor';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig, JWT_CONFIG],
        }),
        EventEmitterModule.forRoot(),
        JwtModule.registerAsync({
            global: true,
            useFactory: jwtConfig,
            inject: [ConfigService],
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: typeOrmConfig,
        }),
        TypeOrmModule.forFeature(Entities),

        /** 비즈니스 */
        FileManagementModule,
        ResourceManagementModule,
        ReservationManagementModule,
        ScheduleManagementModule,
        EmployeeManagementModule,
        TaskManagementModule,
        NotificationManagementModule,
        StatisticsModule,
        AuthManagementModule,
        DomainRequestLogModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestInterceptor,
        },
    ],
})
export class AppModule {}
