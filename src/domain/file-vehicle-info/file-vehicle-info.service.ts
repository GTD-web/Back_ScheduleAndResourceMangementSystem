import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainFileVehicleInfoRepository } from './file-vehicle-info.repository';
import { BaseService } from '../../../libs/services/base.service';
import { FileVehicleInfo } from '../../../libs/entities/file-vehicle-info.entity';

@Injectable()
export class DomainFileVehicleInfoService extends BaseService<FileVehicleInfo> {
    constructor(private readonly fileVehicleInfoRepository: DomainFileVehicleInfoRepository) {
        super(fileVehicleInfoRepository);
    }

    async findByFileVehicleInfoId(fileVehicleInfoId: string): Promise<FileVehicleInfo> {
        const fileVehicleInfo = await this.fileVehicleInfoRepository.findOne({
            where: { fileVehicleInfoId },
        });
        return fileVehicleInfo;
    }

    async findByVehicleInfoId(vehicleInfoId: string): Promise<FileVehicleInfo[]> {
        return this.fileVehicleInfoRepository.findAll({
            where: { vehicleInfoId },
            relations: ['vehicleInfo', 'file'],
        });
    }

    async findByFileId(fileId: string): Promise<FileVehicleInfo[]> {
        return this.fileVehicleInfoRepository.findAll({
            where: { fileId },
            relations: ['vehicleInfo', 'file'],
        });
    }

    async findByType(type: string): Promise<FileVehicleInfo[]> {
        return this.fileVehicleInfoRepository.findAll({
            where: { type },
            relations: ['vehicleInfo', 'file'],
        });
    }

    /**
     * 차량정보 ID로 모든 파일 연결을 삭제한다
     */
    async deleteByVehicleInfoId(vehicleInfoId: string, options?: any): Promise<void> {
        const existingConnections = await this.fileVehicleInfoRepository.findAll({
            where: { vehicleInfoId },
        });

        if (existingConnections.length > 0) {
            for (const connection of existingConnections) {
                await this.fileVehicleInfoRepository.delete(connection.fileVehicleInfoId, options);
            }
        }
    }

    /**
     * 여러 파일-차량정보 연결을 일괄 저장한다
     */
    async saveMultiple(
        connections: Array<{
            vehicleInfoId: string;
            fileId: string;
            type: string;
        }>,
        options?: any,
    ): Promise<FileVehicleInfo[]> {
        const results = [];
        for (const connection of connections) {
            const entity = await this.fileVehicleInfoRepository.save(connection, options);
            results.push(entity);
        }
        return results;
    }
}
