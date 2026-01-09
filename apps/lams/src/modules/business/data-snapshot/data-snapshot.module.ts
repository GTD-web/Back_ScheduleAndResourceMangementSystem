import { Module } from '@nestjs/common';
import { DataSnapshotController } from './data-snapshot.controller';
import { DataSnapshotService } from './data-snapshot.service';
import { DataSnapshotContextModule } from '../../context/data-snapshot';

@Module({
    imports: [DataSnapshotContextModule],
    controllers: [DataSnapshotController],
    providers: [DataSnapshotService],
    exports: [DataSnapshotService],
})
export class DataSnapshotModule {}

