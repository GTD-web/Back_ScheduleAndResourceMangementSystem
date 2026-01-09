import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSnapshotChild } from './data-snapshot-child.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainDataSnapshotChildRepository extends BaseRepository<DataSnapshotChild> {
    constructor(
        @InjectRepository(DataSnapshotChild)
        repository: Repository<DataSnapshotChild>,
    ) {
        super(repository);
    }
}

