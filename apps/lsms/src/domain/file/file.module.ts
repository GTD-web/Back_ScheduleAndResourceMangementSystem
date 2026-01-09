import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { DomainFileService } from './file.service';
import { DomainFileRepository } from './file.repository';

@Module({
    imports: [TypeOrmModule.forFeature([File])],
    providers: [DomainFileService, DomainFileRepository],
    exports: [DomainFileService],
})
export class DomainFileModule {}
