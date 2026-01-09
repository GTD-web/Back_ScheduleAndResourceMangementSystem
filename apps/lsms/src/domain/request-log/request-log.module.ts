import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLog } from './request-log.entity';
import { DomainRequestLogRepository } from './request-log.repository';
import { DomainRequestLogService } from './request-log.service';

@Module({
    imports: [TypeOrmModule.forFeature([RequestLog])],
    providers: [DomainRequestLogRepository, DomainRequestLogService],
    exports: [DomainRequestLogService],
})
export class DomainRequestLogModule {}
