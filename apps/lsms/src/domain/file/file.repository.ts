import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainFileRepository extends BaseRepository<File> {
    constructor(
        @InjectRepository(File)
        repository: Repository<File>,
    ) {
        super(repository);
    }
}
