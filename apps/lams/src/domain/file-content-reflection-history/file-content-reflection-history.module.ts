import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileContentReflectionHistory } from './file-content-reflection-history.entity';
import { DomainFileContentReflectionHistoryService } from './file-content-reflection-history.service';

/**
 * 파일 내용 반영 이력 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([FileContentReflectionHistory])],
    providers: [DomainFileContentReflectionHistoryService],
    exports: [DomainFileContentReflectionHistoryService, TypeOrmModule],
})
export class DomainFileContentReflectionHistoryModule {}

