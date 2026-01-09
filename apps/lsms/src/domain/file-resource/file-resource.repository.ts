import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileResource } from './file-resource.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainFileResourceRepository extends BaseRepository<FileResource> {
    constructor(
        @InjectRepository(FileResource)
        repository: Repository<FileResource>,
    ) {
        super(repository);
    }
}
