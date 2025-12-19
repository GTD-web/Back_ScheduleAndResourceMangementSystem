import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository, UpdateResult } from 'typeorm';
import { Schedule } from '../../../libs/entities/schedule.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';

@Injectable()
export class DomainScheduleRepository extends BaseRepository<Schedule> {
    constructor(
        @InjectRepository(Schedule)
        repository: Repository<Schedule>,
    ) {
        super(repository);
    }

    async softDelete(scheduleId: string, repositoryOptions?: IRepositoryOptions<Schedule>) {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        await repository.softDelete(scheduleId);
    }
}
