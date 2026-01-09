import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { DomainFileService } from './file.service';

/**
 * 파일 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([File])],
    providers: [DomainFileService],
    exports: [DomainFileService, TypeOrmModule],
})
export class DomainFileModule {}
