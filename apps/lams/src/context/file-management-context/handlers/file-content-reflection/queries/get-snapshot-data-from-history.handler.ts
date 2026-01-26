import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { GetSnapshotDataFromHistoryQuery } from './get-snapshot-data-from-history.query';
import { IGetSnapshotDataFromHistoryResponse } from '../../../interfaces';
import { DomainFileContentReflectionHistoryService } from '../../../../../domain/file-content-reflection-history/file-content-reflection-history.service';
import { DomainDataSnapshotInfoService } from '../../../../../domain/data-snapshot-info/data-snapshot-info.service';
import { EventInfo } from '../../../../../domain/event-info/event-info.entity';
import { UsedAttendance } from '../../../../../domain/used-attendance/used-attendance.entity';

/**
 * 스냅샷 데이터 조회 Query Handler
 *
 * 이력 ID를 통해 스냅샷에서 데이터를 추출하여 반환합니다.
 * 실제 복원(삭제 및 저장)은 컨텍스트 서비스에서 다른 핸들러들을 통해 처리됩니다.
 *
 * 1. 이력 ID로 FileContentReflectionHistory를 조회한다
 * 2. FileContentReflectionHistory의 data_snapshot_info_id로 DataSnapshotInfo를 조회한다
 * 3. DataSnapshotInfo의 raw_data에서 eventInfo와 usedAttendance 데이터를 추출한다
 * 4. 추출된 데이터와 메타 정보를 반환한다
 */
@QueryHandler(GetSnapshotDataFromHistoryQuery)
export class GetSnapshotDataFromHistoryHandler implements IQueryHandler<
    GetSnapshotDataFromHistoryQuery,
    IGetSnapshotDataFromHistoryResponse
> {
    private readonly logger = new Logger(GetSnapshotDataFromHistoryHandler.name);

    constructor(
        private readonly fileContentReflectionHistoryService: DomainFileContentReflectionHistoryService,
        private readonly dataSnapshotInfoService: DomainDataSnapshotInfoService,
    ) {}

    async execute(query: GetSnapshotDataFromHistoryQuery): Promise<IGetSnapshotDataFromHistoryResponse> {
        const { reflectionHistoryId } = query.data;

        try {
            this.logger.log(`스냅샷 데이터 조회 시작: reflectionHistoryId=${reflectionHistoryId}`);

            // 1. FileContentReflectionHistory 조회
            const history = await this.fileContentReflectionHistoryService.ID로조회한다(reflectionHistoryId);
            
            if (!history.dataSnapshotInfoId) {
                throw new BadRequestException(
                    `이력에 연결된 스냅샷 정보가 없습니다. (id: ${reflectionHistoryId})`,
                );
            }

            // 2. DataSnapshotInfo 조회 (자식 포함)
            const snapshotDTO = await this.dataSnapshotInfoService.자식포함조회한다(history.dataSnapshotInfoId);

            if (!snapshotDTO) {
                throw new NotFoundException(`스냅샷을 찾을 수 없습니다. (snapshotId: ${history.dataSnapshotInfoId})`);
            }

            // 3. children의 rawData에서 데이터 추출
            if (!snapshotDTO.children || snapshotDTO.children.length === 0) {
                throw new BadRequestException('스냅샷에 저장된 자식 데이터가 없습니다.');
            }

            // children의 rawData를 수집하여 전체 eventInfo와 usedAttendance 재구성
            const allEventInfos: any[] = [];
            const allUsedAttendances: any[] = [];
            let year = '';
            let month = '';

            snapshotDTO.children.forEach((child) => {
                if (child.rawData) {
                    if (!year && child.rawData.year) {
                        year = child.rawData.year;
                    }
                    if (!month && child.rawData.month) {
                        month = child.rawData.month;
                    }
                    if (child.rawData.eventInfo) {
                        allEventInfos.push(...child.rawData.eventInfo);
                    }
                    if (child.rawData.usedAttendance) {
                        allUsedAttendances.push(...child.rawData.usedAttendance);
                    }
                }
            });

            if (!year || !month) {
                throw new BadRequestException('스냅샷에 저장된 데이터가 없거나 형식이 올바르지 않습니다.');
            }

            const eventInfos = allEventInfos;
            const usedAttendances = allUsedAttendances;

            this.logger.log(
                `스냅샷 데이터 조회 완료: year=${year}, month=${month}, eventInfo=${eventInfos.length}건, usedAttendance=${usedAttendances.length}건, snapshotId=${snapshotDTO.id}`,
            );

            return {
                year,
                month,
                eventInfos,
                usedAttendances,
                snapshot: snapshotDTO,
            };
        } catch (error) {
            this.logger.error(`스냅샷 데이터 조회 실패: ${error.message}`, error.stack);

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`스냅샷 데이터 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}
