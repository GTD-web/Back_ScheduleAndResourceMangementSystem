import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainFileResourceService } from './file-resource.service';
import { DomainFileResourceRepository } from './file-resource.repository';
import { FileResource } from '../../../libs/entities/file-resource.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FileResource])],
    providers: [DomainFileResourceService, DomainFileResourceRepository],
    exports: [DomainFileResourceService],
})
export class DomainFileResourceModule {}
