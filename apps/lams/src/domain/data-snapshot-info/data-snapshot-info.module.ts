import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSnapshotInfo } from './data-snapshot-info.entity';
import { DomainDataSnapshotInfoService } from './data-snapshot-info.service';

/**
 * 데이터 스냅샷 정보 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([DataSnapshotInfo])],
    providers: [DomainDataSnapshotInfoService],
    exports: [DomainDataSnapshotInfoService, TypeOrmModule],
})
export class DomainDataSnapshotInfoModule {}

