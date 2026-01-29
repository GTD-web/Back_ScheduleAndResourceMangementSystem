import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { FileContentReflectionHistory } from './file-content-reflection-history.entity';
import {
    CreateFileContentReflectionHistoryData,
    UpdateFileContentReflectionHistoryData,
    FileContentReflectionHistoryDTO,
} from './file-content-reflection-history.types';

/**
 * 파일 내용 반영 이력 서비스
 *
 * 파일 내용 반영 이력 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainFileContentReflectionHistoryService {
    constructor(
        @InjectRepository(FileContentReflectionHistory)
        private readonly repository: Repository<FileContentReflectionHistory>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<FileContentReflectionHistory> {
        return manager ? manager.getRepository(FileContentReflectionHistory) : this.repository;
    }

    /**
     * 파일 내용 반영 이력을 생성한다
     */
    async 생성한다(
        data: CreateFileContentReflectionHistoryData,
        manager?: EntityManager,
    ): Promise<FileContentReflectionHistoryDTO> {
        const repository = this.getRepository(manager);

        const history = new FileContentReflectionHistory(
            data.fileId,
            data.dataSnapshotInfoId || null,
            data.info || null,
            data.selectedAt ?? null,
            data.isSelected ?? false,
        );

        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }

    /**
     * ID로 파일 내용 반영 이력을 조회한다
     */
    async ID로조회한다(id: string): Promise<FileContentReflectionHistoryDTO> {
        const history = await this.repository.findOne({
            where: { id },
            relations: ['file'],
        });
        if (!history) {
            throw new NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        return history.DTO변환한다();
    }

    /**
     * ID로 엔티티를 조회한다 (핸들러에서 연관 데이터 활용용)
     */
    async ID로엔티티조회한다(
        id: string,
        relations: string[] = [],
        manager?: EntityManager,
    ): Promise<FileContentReflectionHistory | null> {
        const repository = this.getRepository(manager);
        return repository.findOne({
            where: { id },
            relations: relations.length > 0 ? relations : undefined,
        });
    }

    /**
     * 동일 파일유형·연월의 반영이력 ID 목록을 조회한다
     */
    async 같은연월유형이력ID목록조회한다(
        fileType: string,
        year: string,
        month: string,
        manager?: EntityManager,
    ): Promise<string[]> {
        const repository = this.getRepository(manager);
        const monthPadded = String(month).padStart(2, '0');
        const list = await repository
            .createQueryBuilder('h')
            .innerJoin('h.file', 'f')
            .where('f.file_type = :fileType', { fileType })
            .andWhere('f.year = :year', { year })
            .andWhere('f.month = :month', { month: monthPadded })
            .andWhere('h.deleted_at IS NULL')
            .select('h.id')
            .getMany();
        return list.map((h) => h.id);
    }

    /**
     * 지정한 이력들의 선택 상태를 해제한다 (is_selected false, selected_at null)
     */
    async 이력선택해제한다(
        ids: string[],
        performedBy: string,
        manager?: EntityManager,
    ): Promise<void> {
        if (ids.length === 0) return;
        const repository = this.getRepository(manager);
        const now = new Date();
        await repository.update(
            { id: In(ids) },
            { is_selected: false, updated_by: performedBy },
        );
    }

    /**
     * 지정한 이력만 선택 상태로 설정한다 (is_selected true, selected_at 갱신)
     */
    async 이력선택설정한다(
        id: string,
        performedBy: string,
        manager?: EntityManager,
    ): Promise<void> {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        const now = new Date();
        history.업데이트한다(undefined, undefined, now, true);
        history.수정자설정한다(performedBy);
        history.메타데이터업데이트한다(performedBy);
        await repository.save(history);
    }

    /**
     * 파일 ID로 반영 이력 목록을 조회한다
     */
    async 파일ID로목록조회한다(fileId: string): Promise<FileContentReflectionHistoryDTO[]> {
        const histories = await this.repository.find({
            where: { file_id: fileId, deleted_at: IsNull() },
            relations: ['file'],
            order: { created_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }

    /**
     * 파일 ID로 반영 이력 엔티티 목록을 조회한다 (스냅샷 연관 포함, 핸들러에서 가공용)
     */
    async 파일ID로엔티티목록조회한다(fileId: string): Promise<FileContentReflectionHistory[]> {
        return this.repository.find({
            where: { file_id: fileId, deleted_at: IsNull() },
            relations: ['file', 'data_snapshot_info'],
            order: { created_at: 'DESC' },
        });
    }

    /**
     * 같은 연월, 같은 유형의 파일들의 반영이력 중 최신 reflect_at 조회
     */
    async 같은연월유형최신반영일시조회한다(
        fileType: string | null,
        year: string | null,
        month: string | null,
        manager?: EntityManager,
    ): Promise<Date | null> {
        if (!fileType || !year || !month) {
            return null;
        }

        const repository = this.getRepository(manager);

        // 파일 반영이력과 파일을 JOIN하여 같은 연월, 같은 유형의 파일들의 반영이력 중 최신 reflect_at 조회
        const latestHistory = await repository
            .createQueryBuilder('history')
            .innerJoin('history.file', 'file')
            .where('file.file_type = :fileType', { fileType: fileType as any })
            .andWhere('file.year = :year', { year })
            .andWhere('file.month = :month', { month: month.padStart(2, '0') })
            .andWhere('file.deleted_at IS NULL')
            .andWhere('history.deleted_at IS NULL')
            .andWhere('history.reflected_at IS NOT NULL')
            .orderBy('history.reflected_at', 'DESC')
            .getOne();

        return latestHistory?.reflected_at || null;
    }

    /**
     * 파일 내용 반영 이력 정보를 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateFileContentReflectionHistoryData,
        userId: string,
        manager?: EntityManager,
    ): Promise<FileContentReflectionHistoryDTO> {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }

        history.업데이트한다(
            data.dataSnapshotInfoId,
            data.info,
            data.selectedAt,
            data.isSelected,
        );
        if (data.reflectedAt !== undefined) {
            history.reflected_at = data.reflectedAt;
        }

        // 수정자 정보 설정
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);

        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }

    /**
     * 반영 완료 처리
     */
    async 완료처리한다(id: string, userId: string, manager?: EntityManager): Promise<FileContentReflectionHistoryDTO> {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }

        history.완료처리한다();
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);

        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }

    /**
     * 파일 내용 반영 이력을 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        history.deleted_at = new Date();
        // 삭제자 정보 설정
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);
        await repository.save(history);
    }

    /**
     * 파일 내용 반영 이력을 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 파일 내용 반영 이력도 조회할 수 있도록 withDeleted 옵션 사용
        const history = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!history) {
            throw new NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(history);
    }

}
