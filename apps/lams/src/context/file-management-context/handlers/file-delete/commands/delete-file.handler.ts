import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { DeleteFileCommand } from './delete-file.command';
import { DomainFileService } from '../../../../../domain/file/file.service';

/**
 * 파일 삭제 Command Handler
 *
 * 파일을 Soft Delete로 삭제합니다.
 */
@CommandHandler(DeleteFileCommand)
export class DeleteFileHandler implements ICommandHandler<DeleteFileCommand, void> {
    private readonly logger = new Logger(DeleteFileHandler.name);

    constructor(private readonly fileService: DomainFileService) {}

    async execute(command: DeleteFileCommand): Promise<void> {
        const { fileId, userId } = command.data;

        this.logger.log(`파일 삭제 시작: fileId=${fileId}, userId=${userId}`);

        await this.fileService.삭제한다(fileId, userId);

        this.logger.log(`파일 삭제 완료: fileId=${fileId}`);
    }
}
