import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainResourceGroupService } from './resource-group.service';
import { DomainResourceGroupRepository } from './resource-group.repository';
import { ResourceGroup } from '../../../libs/entities/resource-group.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ResourceGroup])],
    providers: [DomainResourceGroupService, DomainResourceGroupRepository],
    exports: [DomainResourceGroupService],
})
export class DomainResourceGroupModule {}
