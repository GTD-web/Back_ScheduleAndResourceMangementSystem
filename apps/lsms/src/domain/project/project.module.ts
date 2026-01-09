import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DomainProjectService } from './project.service';
import { ProjectMicroserviceAdapter } from './project.adapter';

@Module({
    imports: [
        HttpModule.register({
            timeout: 10000, // 10ì´??€?„ì•„??
            maxRedirects: 5,
        }),
        ConfigModule,
    ],
    providers: [DomainProjectService, ProjectMicroserviceAdapter],
    exports: [DomainProjectService, ProjectMicroserviceAdapter],
})
export class DomainProjectModule {}
