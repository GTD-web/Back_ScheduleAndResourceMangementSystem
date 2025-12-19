import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainResourceService } from './resource.service';
import { DomainResourceRepository } from './resource.repository';
import { Resource } from '../../../libs/entities/resource.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Resource])],
    providers: [DomainResourceService, DomainResourceRepository],
    exports: [DomainResourceService],
})
export class DomainResourceModule {}
