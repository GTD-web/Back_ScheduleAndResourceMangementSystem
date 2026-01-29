import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaveReflectionHistoryCommand } from './save-reflection-history.command';
import { SetReflectionHistorySelectedCommand } from './set-reflection-history-selected.command';
import { DomainFileContentReflectionHistoryService } from '../../../../../domain/file-content-reflection-history/file-content-reflection-history.service';

/**
 * 파일 내용 반영 이력 저장 핸들러
 *
 * 파일 내용 반영에 대한 이력을 저장합니다.
 */
@CommandHandler(SaveReflectionHistoryCommand)
export class SaveReflectionHistoryHandler
    implements ICommandHandler<SaveReflectionHistoryCommand, { id: string }>
{
    private readonly logger = new Logger(SaveReflectionHistoryHandler.name);

    constructor(
        private readonly fileContentReflectionHistoryService: DomainFileContentReflectionHistoryService,
        private readonly dataSource: DataSource,
        private readonly commandBus: CommandBus,
    ) {}

    async execute(command: SaveReflectionHistoryCommand): Promise<{ id: string }> {
        const { fileId, dataSnapshotInfoId, info, performedBy } = command.data;

        const { id } = await this.dataSource.transaction(async (manager) => {
            const reflectionHistory = await this.fileContentReflectionHistoryService.생성한다(
                {
                    fileId,
                    dataSnapshotInfoId,
                    info,
                },
                manager,
            );

            this.logger.log(`파일 내용 반영 이력 저장 완료: reflectionHistoryId=${reflectionHistory.id}`);

            return { id: reflectionHistory.id };
        });

        // 동일 파일유형·연월에서 is_selected true 1건만 유지, 선택 시 selected_at 갱신 (핸들러로 위임)
        await this.commandBus.execute(
            new SetReflectionHistorySelectedCommand({
                reflectionHistoryId: id,
                performedBy: performedBy ?? 'system',
            }),
        );

        return { id };
    }
}
