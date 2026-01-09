import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainRankRepository } from './rank.repository';
import { BaseService } from '../../../common/services/base.service';
import { Rank } from './rank.entity';

@Injectable()
export class DomainRankService extends BaseService<Rank> {
    constructor(private readonly rankRepository: DomainRankRepository) {
        super(rankRepository);
    }
}
