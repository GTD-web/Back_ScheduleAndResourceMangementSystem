import { Injectable } from '@nestjs/common';
import { File } from '../../../libs/entities/file.entity';
import { BaseService } from '../../../libs/services/base.service';
import { DomainFileRepository } from './file.repository';
import { In } from 'typeorm';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DomainFileService extends BaseService<File> {
    constructor(
        private readonly fileRepository: DomainFileRepository,
        private readonly configService: ConfigService,
    ) {
        super(fileRepository);
    }

    async findFileById(fileId: string): Promise<File> {
        const file = await this.fileRepository.findOne({ where: { fileId } });
        return file;
    }

    async findFileByFilePath(filePath: string): Promise<File> {
        const file = await this.fileRepository.findOne({ where: { filePath } });
        return file;
    }

    async findAllFilesByFilePath(filePath: string[]): Promise<File[]> {
        if (!filePath || filePath.length === 0) {
            return [];
        }
        const files = await this.fileRepository.findAll({ where: { filePath: In(filePath) } });
        return files;
    }

    async updateTemporaryFiles(
        filePaths: string[],
        isTemporary: boolean,
        repositoryOptions?: IRepositoryOptions<File>,
    ): Promise<void> {
        await Promise.all(
            filePaths.map(async (filePath) => {
                const fileName = filePath.split('/').pop();

                const fileExists = await this.fileRepository.findOne({ where: { filePath } });
                if (fileExists) {
                    await this.fileRepository.update(fileExists.fileId, { isTemporary }, repositoryOptions);
                    return;
                }

                const file = await this.create({
                    fileName,
                    filePath,
                    isTemporary,
                });
                await this.fileRepository.save(file, repositoryOptions);
            }),
        );
    }

    async deleteFilesByFilePath(filePaths: string[], repositoryOptions?: IRepositoryOptions<File>): Promise<void> {
        const files = await this.fileRepository.findAll({ where: { filePath: In(filePaths) } });
        await Promise.all(files.map((file) => this.fileRepository.delete(file.fileId, repositoryOptions)));
    }

    getFileUrl(filePath: string): string {
        const fileKey = filePath.split('/').pop();
        return `${this.configService.get<string>('S3_ENDPOINT').replace('s3', 'object/public')}/${this.configService.get<string>('S3_BUCKET_NAME')}/${fileKey}`;
    }
}
