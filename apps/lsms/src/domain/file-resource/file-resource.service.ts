import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainFileResourceRepository } from './file-resource.repository';
import { BaseService } from '../../../libs/services/base.service';
import { FileResource } from './file-resource.entity';

@Injectable()
export class DomainFileResourceService extends BaseService<FileResource> {
    constructor(private readonly fileResourceRepository: DomainFileResourceRepository) {
        super(fileResourceRepository);
    }

    async findByFileResourceId(fileResourceId: string): Promise<FileResource> {
        const fileResource = await this.fileResourceRepository.findOne({
            where: { fileResourceId },
        });
        return fileResource;
    }

    async findByResourceId(resourceId: string): Promise<FileResource[]> {
        return this.fileResourceRepository.findAll({
            where: { resourceId },
            relations: ['resource', 'file'],
        });
    }

    async findByFileId(fileId: string): Promise<FileResource[]> {
        return this.fileResourceRepository.findAll({
            where: { fileId },
            relations: ['resource', 'file'],
        });
    }

    /**
     * 리소스 ID로 모든 파일 연결을 삭제한다
     */
    async deleteByResourceId(resourceId: string, options?: any): Promise<void> {
        const existingConnections = await this.fileResourceRepository.findAll({
            where: { resourceId },
        });

        if (existingConnections.length > 0) {
            for (const connection of existingConnections) {
                await this.fileResourceRepository.delete(connection.fileResourceId, options);
            }
        }
    }

    /**
     * 여러 파일-리소스 연결을 일괄 저장한다
     */
    async saveMultiple(
        connections: Array<{
            resourceId: string;
            fileId: string;
        }>,
        options?: any,
    ): Promise<FileResource[]> {
        const results = [];
        for (const connection of connections) {
            const entity = await this.fileResourceRepository.save(connection, options);
            results.push(entity);
        }
        return results;
    }
}
