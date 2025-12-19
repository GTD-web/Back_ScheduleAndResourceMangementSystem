import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainFileReservationVehicleRepository } from './file-reservation-vehicle.repository';
import { BaseService } from '../../../libs/services/base.service';
import { FileReservationVehicle } from '../../../libs/entities/file-reservation-vehicle.entity';

@Injectable()
export class DomainFileReservationVehicleService extends BaseService<FileReservationVehicle> {
    constructor(private readonly fileReservationVehicleRepository: DomainFileReservationVehicleRepository) {
        super(fileReservationVehicleRepository);
    }

    async findByFileReservationVehicleId(fileReservationVehicleId: string): Promise<FileReservationVehicle> {
        const fileReservationVehicle = await this.fileReservationVehicleRepository.findOne({
            where: { fileReservationVehicleId },
        });
        return fileReservationVehicle;
    }

    async findByReservationVehicleId(reservationVehicleId: string): Promise<FileReservationVehicle[]> {
        return this.fileReservationVehicleRepository.findAll({
            where: { reservationVehicleId },
            relations: ['reservationVehicle', 'file'],
        });
    }

    async findByFileId(fileId: string): Promise<FileReservationVehicle[]> {
        return this.fileReservationVehicleRepository.findAll({
            where: { fileId },
            relations: ['reservationVehicle', 'file'],
        });
    }

    async findByType(type: string): Promise<FileReservationVehicle[]> {
        return this.fileReservationVehicleRepository.findAll({
            where: { type },
            relations: ['reservationVehicle', 'file'],
        });
    }

    /**
     * 차량예약 ID로 모든 파일 연결을 삭제한다
     */
    async deleteByReservationVehicleId(reservationVehicleId: string, options?: any): Promise<void> {
        const existingConnections = await this.fileReservationVehicleRepository.findAll({
            where: { reservationVehicleId },
        });

        if (existingConnections.length > 0) {
            for (const connection of existingConnections) {
                await this.fileReservationVehicleRepository.delete(connection.fileReservationVehicleId, options);
            }
        }
    }

    /**
     * 여러 파일-차량예약 연결을 일괄 저장한다
     */
    async saveMultiple(
        connections: Array<{
            reservationVehicleId: string;
            fileId: string;
            type: string;
        }>,
        options?: any,
    ): Promise<FileReservationVehicle[]> {
        const results = [];
        for (const connection of connections) {
            const entity = await this.fileReservationVehicleRepository.save(connection, options);
            results.push(entity);
        }
        return results;
    }
}
