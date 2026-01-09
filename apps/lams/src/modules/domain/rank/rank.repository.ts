import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rank } from './rank.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainRankRepository extends BaseRepository<Rank> {
    constructor(
        @InjectRepository(Rank)
        repository: Repository<Rank>,
    ) {
        super(repository);
    }
}
