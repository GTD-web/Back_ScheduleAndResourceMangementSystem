import { Module } from '@nestjs/common';
import { FileManagementContext } from './file-management.context';
import { S3StorageModule } from '../../integrations/s3-storage';
import { DomainFileModule } from '../../domain/file';
import { ExcelReaderModule } from '../../integrations/excel-reader';

@Module({
    imports: [S3StorageModule, DomainFileModule, ExcelReaderModule],
    providers: [FileManagementContext],
    exports: [FileManagementContext],
})
export class FileManagementModule {}
