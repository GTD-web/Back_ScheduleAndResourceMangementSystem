import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainPositionRepository } from './position.repository';
import { BaseService } from '../../../common/services/base.service';
import { Position } from './position.entity';

@Injectable()
export class DomainPositionService extends BaseService<Position> {
    constructor(private readonly positionRepository: DomainPositionRepository) {
        super(positionRepository);
    }
}
