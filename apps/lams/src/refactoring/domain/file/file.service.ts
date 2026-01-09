import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { File } from './file.entity';
import { FileDTO } from './file.types';
import { CreateFileData, UpdateFileData, FileStatus } from './file.types';

/**
 * 파일 서비스
 *
 * 파일 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainFileService {
    constructor(
        @InjectRepository(File)
        private readonly repository: Repository<File>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<File> {
        return manager ? manager.getRepository(File) : this.repository;
    }

    /**
     * 파일을 생성한다
     */
    async 생성한다(data: CreateFileData, manager?: EntityManager): Promise<FileDTO> {
        const repository = this.getRepository(manager);

        const file = new File(
            data.fileName,
            data.filePath,
            data.fileOriginalName,
            data.year,
            data.month,
            data.data,
        );

        const saved = await repository.save(file);
        return saved.DTO변환한다();
    }

    /**
     * ID로 파일을 조회한다
     */
    async ID로조회한다(id: string): Promise<FileDTO> {
        const file = await this.repository.findOne({ where: { id } });
        if (!file) {
            throw new NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }
        return file.DTO변환한다();
    }

    /**
     * 파일명으로 파일을 조회한다
     */
    async 파일명으로조회한다(fileName: string): Promise<FileDTO | null> {
        const file = await this.repository.findOne({
            where: { file_name: fileName, deleted_at: IsNull() },
        });
        return file ? file.DTO변환한다() : null;
    }

    /**
     * 파일 목록을 조회한다
     */
    async 목록조회한다(): Promise<FileDTO[]> {
        const files = await this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        });
        return files.map((file) => file.DTO변환한다());
    }

    /**
     * 파일 상태별 목록을 조회한다
     */
    async 상태별목록조회한다(status: FileStatus): Promise<FileDTO[]> {
        const files = await this.repository.find({
            where: { status, deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        });
        return files.map((file) => file.DTO변환한다());
    }

    /**
     * 연도/월별 파일 목록을 조회한다
     */
    async 연도월별목록조회한다(year: string, month: string): Promise<FileDTO[]> {
        const files = await this.repository.find({
            where: {
                year,
                month: month.padStart(2, '0'),
                deleted_at: IsNull(),
            },
            order: { created_at: 'DESC' },
        });
        return files.map((file) => file.DTO변환한다());
    }

    /**
     * 업로드한 사용자별 파일 목록을 조회한다
     */
    async 업로드자별목록조회한다(uploadBy: string): Promise<FileDTO[]> {
        const files = await this.repository.find({
            where: { created_by: uploadBy, deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        });
        return files.map((file) => file.DTO변환한다());
    }

    /**
     * 읽지 않은 파일 목록을 조회한다
     */
    async 읽지않은목록조회한다(): Promise<FileDTO[]> {
        return this.상태별목록조회한다(FileStatus.UNREAD);
    }

    /**
     * 에러 파일 목록을 조회한다
     */
    async 에러목록조회한다(): Promise<FileDTO[]> {
        return this.상태별목록조회한다(FileStatus.ERROR);
    }

    /**
     * 파일 정보를 수정한다
     */
    async 수정한다(id: string, data: UpdateFileData, userId: string, manager?: EntityManager): Promise<FileDTO> {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({ where: { id } });
        if (!file) {
            throw new NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }

        file.업데이트한다(
            data.fileName,
            data.fileOriginalName,
            data.filePath,
            data.year,
            data.month,
            data.status,
            data.error,
        );

        // 수정자 정보 설정
        file.수정자설정한다(userId);
        file.메타데이터업데이트한다(userId);

        const saved = await repository.save(file);
        return saved.DTO변환한다();
    }

    /**
     * 파일 읽음 처리
     */
    async 읽음처리한다(id: string, userId: string, manager?: EntityManager): Promise<FileDTO> {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({ where: { id } });
        if (!file) {
            throw new NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }

        file.읽음처리한다();
        file.수정자설정한다(userId);
        file.메타데이터업데이트한다(userId);

        const saved = await repository.save(file);
        return saved.DTO변환한다();
    }

    /**
     * 파일 에러 처리
     */
    async 에러처리한다(id: string, error: any, userId: string, manager?: EntityManager): Promise<FileDTO> {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({ where: { id } });
        if (!file) {
            throw new NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }

        file.에러처리한다(error);
        file.수정자설정한다(userId);
        file.메타데이터업데이트한다(userId);

        const saved = await repository.save(file);
        return saved.DTO변환한다();
    }

    /**
     * 파일 연도/월 설정
     */
    async 연도월설정한다(
        id: string,
        year: string,
        month: string,
        userId: string,
        manager?: EntityManager,
    ): Promise<FileDTO> {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({ where: { id } });
        if (!file) {
            throw new NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }

        file.연도월설정한다(year, month);
        file.수정자설정한다(userId);
        file.메타데이터업데이트한다(userId);

        const saved = await repository.save(file);
        return saved.DTO변환한다();
    }

    /**
     * 파일을 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({ where: { id } });
        if (!file) {
            throw new NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        file.deleted_at = new Date();
        // 삭제자 정보 설정
        file.수정자설정한다(userId);
        file.메타데이터업데이트한다(userId);
        await repository.save(file);
    }

    /**
     * 파일을 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 파일도 조회할 수 있도록 withDeleted 옵션 사용
        const file = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!file) {
            throw new NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(file);
    }
}
