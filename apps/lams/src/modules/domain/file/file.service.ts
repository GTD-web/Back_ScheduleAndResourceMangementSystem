import { Injectable } from '@nestjs/common';
import { DomainFileRepository } from './file.repository';
import { BaseService } from '../../../common/services/base.service';
import { File, FileStatus } from './file.entity';

/**
 * 파일 도메인 서비스
 */
@Injectable()
export class DomainFileService extends BaseService<File> {
    constructor(private readonly fileRepository: DomainFileRepository) {
        super(fileRepository);
    }

    /**
     * 파일 상태별 조회
     */
    async findByStatus(status: FileStatus): Promise<File[]> {
        return this.fileRepository.findByStatus(status);
    }

    /**
     * 연도/월별 파일 조회
     */
    async findByYearAndMonth(year: string, month: string): Promise<File[]> {
        return this.fileRepository.findByYearAndMonth(year, month);
    }

    /**
     * 업로드한 사용자별 파일 조회
     */
    async findByUploadBy(uploadBy: string): Promise<File[]> {
        return this.fileRepository.findByUploadBy(uploadBy);
    }

    /**
     * 읽지 않은 파일 조회
     */
    async findUnreadFiles(): Promise<File[]> {
        return this.fileRepository.findUnreadFiles();
    }

    /**
     * 에러 파일 조회
     */
    async findErrorFiles(): Promise<File[]> {
        return this.fileRepository.findErrorFiles();
    }

    /**
     * 파일명으로 조회
     */
    async findByFileName(fileName: string): Promise<File | null> {
        return this.fileRepository.findByFileName(fileName);
    }

    /**
     * 파일 읽음 처리
     */
    async markAsRead(fileId: string): Promise<File> {
        const file = await this.fileRepository.findOne({ where: { fileId } });
        if (!file) {
            throw new Error('파일을 찾을 수 없습니다.');
        }

        file.readFile();
        return this.fileRepository.save(file);
    }

    /**
     * 파일 에러 처리
     */
    async markAsError(fileId: string, error: any): Promise<File> {
        const file = await this.fileRepository.findOne({ where: { fileId } });
        if (!file) {
            throw new Error('파일을 찾을 수 없습니다.');
        }

        file.errorFile(error);
        return this.fileRepository.save(file);
    }

    /**
     * 파일 연도/월 설정
     */
    async setYearAndMonth(fileId: string, year: string, month: string): Promise<File> {
        const file = await this.fileRepository.findOne({ where: { fileId } });
        if (!file) {
            throw new Error('파일을 찾을 수 없습니다.');
        }

        file.setYearAndMonth(year, month);
        return this.fileRepository.save(file);
    }

    /**
     * 파일 생성
     */
    async createFile(data: {
        fileName: string;
        fileOriginalName?: string;
        filePath: string;
        uploadBy: string;
        year?: string;
        month?: string;
    }): Promise<File> {
        const file = await this.fileRepository.create(data);
        return await this.fileRepository.save(file);
    }
}
