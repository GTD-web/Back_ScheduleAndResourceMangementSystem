import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { SetReflectionHistorySelectedCommand } from './set-reflection-history-selected.command';
import { DomainFileContentReflectionHistoryService } from '../../../../../domain/file-content-reflection-history/file-content-reflection-history.service';

/**
 * 반영이력 선택 상태 설정 핸들러
 *
 * 동일 파일유형·연월에서 해당 반영이력만 선택 상태로 설정한다 (is_selected true 1건, selected_at 갱신).
 * 도메인 서비스의 단순 조회/수정 메서드를 조합해 핸들러에서 흐름을 담당한다.
 */
@CommandHandler(SetReflectionHistorySelectedCommand)
export class SetReflectionHistorySelectedHandler
    implements ICommandHandler<SetReflectionHistorySelectedCommand, void>
{
    private readonly logger = new Logger(SetReflectionHistorySelectedHandler.name);

    constructor(
        private readonly fileContentReflectionHistoryService: DomainFileContentReflectionHistoryService,
    ) {}

    async execute(command: SetReflectionHistorySelectedCommand): Promise<void> {
        const { reflectionHistoryId, performedBy } = command.data;

        // 1. 대상 이력 조회 (연관 파일로 연월·유형 판단)
        const history = await this.fileContentReflectionHistoryService.ID로엔티티조회한다(
            reflectionHistoryId,
            ['file'],
        );
        if (!history) {
            throw new NotFoundException(
                `파일 내용 반영 이력을 찾을 수 없습니다. (id: ${reflectionHistoryId})`,
            );
        }
        const file = history.file;
        if (!file?.file_type || file.year == null || file.month == null) {
            this.logger.warn(
                `반영이력 선택 생략: file_type/year/month 없음, reflectionHistoryId=${reflectionHistoryId}`,
            );
            return;
        }

        // 2. 동일 파일유형·연월 이력 ID 목록 조회
        const sameScopeIds =
            await this.fileContentReflectionHistoryService.같은연월유형이력ID목록조회한다(
                file.file_type,
                file.year,
                file.month,
            );
        const idsToUnselect = sameScopeIds.filter((id) => id !== reflectionHistoryId);

        // 3. 같은 범위 내 나머지 이력 선택 해제
        if (idsToUnselect.length > 0) {
            await this.fileContentReflectionHistoryService.이력선택해제한다(
                idsToUnselect,
                performedBy,
            );
        }

        // 4. 대상 이력만 선택 상태로 설정 (selected_at 갱신)
        await this.fileContentReflectionHistoryService.이력선택설정한다(
            reflectionHistoryId,
            performedBy,
        );

        this.logger.log(`반영이력 선택 상태 설정 완료: reflectionHistoryId=${reflectionHistoryId}`);
    }
}
