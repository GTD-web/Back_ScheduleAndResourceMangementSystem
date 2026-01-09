import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { FileContentReflectionHistory } from './file-content-reflection-history.entity';
import {
    CreateFileContentReflectionHistoryData,
    UpdateFileContentReflectionHistoryData,
    ReflectionStatus,
    ReflectionType,
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
            data.type,
            data.data,
            data.status || ReflectionStatus.PENDING,
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
     * 파일 ID로 반영 이력 목록을 조회한다
     */
    async 파일ID로목록조회한다(fileId: string): Promise<FileContentReflectionHistoryDTO[]> {
        const histories = await this.repository.find({
            where: { file_id: fileId, deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }

    /**
     * 상태별 반영 이력 목록을 조회한다
     */
    async 상태별목록조회한다(status: ReflectionStatus): Promise<FileContentReflectionHistoryDTO[]> {
        const histories = await this.repository.find({
            where: { status, deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }

    /**
     * 타입별 반영 이력 목록을 조회한다
     */
    async 타입별목록조회한다(type: ReflectionType): Promise<FileContentReflectionHistoryDTO[]> {
        const histories = await this.repository.find({
            where: { type, deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }

    /**
     * 대기 중인 반영 이력 목록을 조회한다
     */
    async 대기중목록조회한다(): Promise<FileContentReflectionHistoryDTO[]> {
        return this.상태별목록조회한다(ReflectionStatus.PENDING);
    }

    /**
     * 처리 중인 반영 이력 목록을 조회한다
     */
    async 처리중목록조회한다(): Promise<FileContentReflectionHistoryDTO[]> {
        return this.상태별목록조회한다(ReflectionStatus.PROCESSING);
    }

    /**
     * 완료된 반영 이력 목록을 조회한다
     */
    async 완료된목록조회한다(): Promise<FileContentReflectionHistoryDTO[]> {
        return this.상태별목록조회한다(ReflectionStatus.COMPLETED);
    }

    /**
     * 실패한 반영 이력 목록을 조회한다
     */
    async 실패한목록조회한다(): Promise<FileContentReflectionHistoryDTO[]> {
        return this.상태별목록조회한다(ReflectionStatus.FAILED);
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

        history.업데이트한다(data.status, data.data);

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
     * 반영 실패 처리
     */
    async 실패처리한다(id: string, userId: string, manager?: EntityManager): Promise<FileContentReflectionHistoryDTO> {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }

        history.실패처리한다();
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);

        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }

    /**
     * 처리 중 상태로 변경
     */
    async 처리중처리한다(
        id: string,
        userId: string,
        manager?: EntityManager,
    ): Promise<FileContentReflectionHistoryDTO> {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }

        history.처리중처리한다();
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
