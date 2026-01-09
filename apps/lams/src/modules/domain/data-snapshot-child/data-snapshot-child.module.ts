import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainDataSnapshotChildService } from './data-snapshot-child.service';
import { DomainDataSnapshotChildRepository } from './data-snapshot-child.repository';
import { DataSnapshotChild } from './data-snapshot-child.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DataSnapshotChild])],
    providers: [DomainDataSnapshotChildService, DomainDataSnapshotChildRepository],
    exports: [DomainDataSnapshotChildService],
})
export class DomainDataSnapshotChildModule {}

