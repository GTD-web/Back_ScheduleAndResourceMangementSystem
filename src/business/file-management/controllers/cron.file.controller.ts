import { Public } from '../../../../libs/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { FileManagementService } from '../file-management.service';

@ApiTags('v2 파일 관리')
@Public()
@Controller('v2/files')
export class CronFileController {
    constructor(private readonly fileManagementService: FileManagementService) {}

    @ApiExcludeEndpoint()
    @Get('cron-job/delete-temporary-file')
    async deleteTemporaryFile() {
        return this.fileManagementService.deleteTemporaryFiles();
    }
}
