import { Module } from '@nestjs/common';
import { DataSnapshotContext } from './data-snapshot.context';
import { DomainDataSnapshotInfoModule } from '../../domain/data-snapshot-info/data-snapshot-info.module';
import { DomainDataSnapshotChildModule } from '../../domain/data-snapshot-child/data-snapshot-child.module';

@Module({
    imports: [DomainDataSnapshotInfoModule, DomainDataSnapshotChildModule],
    providers: [DataSnapshotContext],
    exports: [DataSnapshotContext],
})
export class DataSnapshotContextModule {}
