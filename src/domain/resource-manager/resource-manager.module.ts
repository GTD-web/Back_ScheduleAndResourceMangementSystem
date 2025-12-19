import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainResourceManagerService } from './resource-manager.service';
import { DomainResourceManagerRepository } from './resource-manager.repository';
import { ResourceManager } from '../../../libs/entities/resource-manager.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ResourceManager])],
    providers: [DomainResourceManagerService, DomainResourceManagerRepository],
    exports: [DomainResourceManagerService],
})
export class DomainResourceManagerModule {}
