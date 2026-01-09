import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainDataSnapshotInfoService } from './data-snapshot-info.service';
import { DomainDataSnapshotInfoRepository } from './data-snapshot-info.repository';
import { DataSnapshotInfo } from './data-snapshot-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DataSnapshotInfo])],
    providers: [DomainDataSnapshotInfoService, DomainDataSnapshotInfoRepository],
    exports: [DomainDataSnapshotInfoService],
})
export class DomainDataSnapshotInfoModule {}

