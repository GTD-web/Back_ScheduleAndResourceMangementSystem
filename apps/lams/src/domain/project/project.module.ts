import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { DomainProjectService } from './project.service';

/**
 * 프로젝트 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([Project])],
    providers: [DomainProjectService],
    exports: [DomainProjectService, TypeOrmModule],
})
export class DomainProjectModule {}

