import { Injectable } from '@nestjs/common';
import { DomainDataSnapshotChildRepository } from './data-snapshot-child.repository';
import { BaseService } from '../../../common/services/base.service';
import { DataSnapshotChild } from './data-snapshot-child.entity';

@Injectable()
export class DomainDataSnapshotChildService extends BaseService<DataSnapshotChild> {
    constructor(private readonly dataSnapshotChildRepository: DomainDataSnapshotChildRepository) {
        super(dataSnapshotChildRepository);
    }
}

