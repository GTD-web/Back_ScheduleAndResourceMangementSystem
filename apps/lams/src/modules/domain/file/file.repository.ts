import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File, FileStatus } from './file.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainFileRepository extends BaseRepository<File> {
    constructor(
        @InjectRepository(File)
        repository: Repository<File>,
    ) {
        super(repository);
    }

    /**
     * 파일 상태별 조회
     */
    async findByStatus(status: FileStatus): Promise<File[]> {
        return this.repository.find({
            where: { status },
            order: { uploadedAt: 'DESC' },
        });
    }

    /**
     * 연도/월별 파일 조회
     */
    async findByYearAndMonth(year: string, month: string): Promise<File[]> {
        return this.repository.find({
            where: {
                year,
                month: month.padStart(2, '0'),
            },
            order: { uploadedAt: 'DESC' },
        });
    }

    /**
     * 업로드한 사용자별 파일 조회
     */
    async findByUploadBy(uploadBy: string): Promise<File[]> {
        return this.repository.find({
            where: { uploadBy },
            order: { uploadedAt: 'DESC' },
        });
    }

    /**
     * 읽지 않은 파일 조회
     */
    async findUnreadFiles(): Promise<File[]> {
        return this.findByStatus(FileStatus.UNREAD);
    }

    /**
     * 에러 파일 조회
     */
    async findErrorFiles(): Promise<File[]> {
        return this.findByStatus(FileStatus.ERROR);
    }

    /**
     * 파일명으로 조회
     */
    async findByFileName(fileName: string): Promise<File | null> {
        return this.repository.findOne({
            where: { fileName },
        });
    }
}
