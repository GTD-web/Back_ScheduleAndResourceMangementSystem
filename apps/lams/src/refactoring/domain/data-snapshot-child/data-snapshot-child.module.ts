import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSnapshotChild } from './data-snapshot-child.entity';
import { DomainDataSnapshotChildService } from './data-snapshot-child.service';

/**
 * 데이터 스냅샷 자식 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([DataSnapshotChild])],
    providers: [DomainDataSnapshotChildService],
    exports: [DomainDataSnapshotChildService, TypeOrmModule],
})
export class DomainDataSnapshotChildModule {}

