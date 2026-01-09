import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainFileService } from './file.service';
import { DomainFileRepository } from './file.repository';
import { File } from './file.entity';

@Module({
    imports: [TypeOrmModule.forFeature([File])],
    providers: [DomainFileService, DomainFileRepository],
    exports: [DomainFileService],
})
export class DomainFileModule {}
