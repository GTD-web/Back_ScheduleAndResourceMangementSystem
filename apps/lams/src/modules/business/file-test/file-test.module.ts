import { Module } from '@nestjs/common';
import { FileTestController } from './file-test.controller';
import { FileManagementModule } from '../../context/file-management';
import { ExcelReaderModule } from '../../integrations/excel-reader';

@Module({
    imports: [FileManagementModule, ExcelReaderModule],
    controllers: [FileTestController],
})
export class FileTestModule {}
