import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignedProject } from './assigned-project.entity';
import { DomainAssignedProjectService } from './assigned-project.service';
import { DomainProjectModule } from '../project/project.module';

/**
 * 할당된 프로젝트 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([AssignedProject]), DomainProjectModule],
    providers: [DomainAssignedProjectService],
    exports: [DomainAssignedProjectService, TypeOrmModule],
})
export class DomainAssignedProjectModule {}

