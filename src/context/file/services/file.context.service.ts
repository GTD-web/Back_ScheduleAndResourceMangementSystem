import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DomainFileService } from '../../../domain/file/file.service';
import { DomainFileReservationVehicleService } from '../../../domain/file-reservation-vehicle/file-reservation-vehicle.service';
import { DomainFileVehicleInfoService } from '../../../domain/file-vehicle-info/file-vehicle-info.service';
import { DomainFileMaintenanceService } from '../../../domain/file-maintenance/file-maintenance.service';
import { In, LessThan } from 'typeorm';
import { File } from '../../../../libs/entities/file.entity';
import { ReservationVehicleFileResponseDto } from '../dtos';
import { S3Service } from '../adapter/s3.service';
import { MimeType } from '../../../../libs/enums/mime-type.enum';
import { ERROR_MESSAGE } from '../../../../libs/constants/error-message';
import { DateUtil } from '../../../../libs/utils/date.util';
import { DomainFileResourceService } from '../../../domain/file-resource/file-resource.service';

export interface CreateFileDataDto {
    filePath: string;
}

@Injectable()
export class FileContextService {
    constructor(
        private readonly domainFileService: DomainFileService,
        private readonly domainFileReservationVehicleService: DomainFileReservationVehicleService,
        private readonly domainFileVehicleInfoService: DomainFileVehicleInfoService,
        private readonly domainFileResourceService: DomainFileResourceService,
        private readonly domainFileMaintenanceService: DomainFileMaintenanceService,
        private readonly s3Service: S3Service,
    ) {}

    async 차량예약_파일을_조회한다(reservationVehicleId: string): Promise<ReservationVehicleFileResponseDto> {
        const fileReservationVehicles = await this.domainFileReservationVehicleService.findAll({
            where: { reservationVehicleId },
        });
        const result = {
            parkingLocationImages: [],
            odometerImages: [],
            indoorImages: [],
        };

        for (const fileReservationVehicle of fileReservationVehicles) {
            if (fileReservationVehicle.type === 'PARKING_LOCATION') {
                result.parkingLocationImages.push(fileReservationVehicle.fileId);
            } else if (fileReservationVehicle.type === 'ODOMETER') {
                result.odometerImages.push(fileReservationVehicle.fileId);
            } else if (fileReservationVehicle.type === 'INDOOR') {
                result.indoorImages.push(fileReservationVehicle.fileId);
            }
        }

        return {
            parkingLocationImages: await this.domainFileService.findAll({
                where: { fileId: In(result.parkingLocationImages) },
            }),
            odometerImages: await this.domainFileService.findAll({
                where: { fileId: In(result.odometerImages) },
            }),
            indoorImages: await this.domainFileService.findAll({
                where: { fileId: In(result.indoorImages) },
            }),
        };
    }

    // 파일 업로드 관련 메서드들
    async 파일을_업로드한다(file: Express.Multer.File): Promise<File> {
        const newFile = await this.s3Service.uploadFile(file);
        const savedFile = await this.domainFileService.save(newFile);
        return savedFile;
    }

    async 다중_파일을_업로드한다(files: Express.Multer.File[]): Promise<File[]> {
        const uploadPromises = files.map((file) => this.파일을_업로드한다(file));
        return await Promise.all(uploadPromises);
    }

    // 파일 삭제 관련 메서드들
    async 파일을_삭제한다(fileId: string): Promise<void> {
        let file: File;
        if (fileId) {
            file = await this.domainFileService.findFileById(fileId);
            if (!file) throw new NotFoundException(ERROR_MESSAGE.BUSINESS.FILE.NOT_FOUND);
        } else {
            throw new BadRequestException(ERROR_MESSAGE.BUSINESS.FILE.ID_OR_PATH_REQUIRED);
        }

        await this.s3Service.deleteFile(file);
        await this.domainFileService.delete(file.fileId);
    }

    async 다중_파일을_삭제한다(fileIds: string[]): Promise<void> {
        const deletePromises = fileIds.map((fileId) => this.파일을_삭제한다(fileId));
        await Promise.all(deletePromises);
    }

    async 임시_파일들을_삭제한다(): Promise<void> {
        const files = await this.임시_파일들을_조회한다();
        const deletePromises = files.map((file) => this.파일을_삭제한다(file.fileId));
        await Promise.all(deletePromises);
    }

    // 파일 조회 관련 메서드들
    async 임시_파일들을_조회한다(): Promise<File[]> {
        return await this.domainFileService.findAll({
            where: { isTemporary: true, createdAt: LessThan(DateUtil.now().addDays(-1).toDate()) },
        });
    }

    // Presigned URL 관련 메서드들
    async 프리사인드_URL을_생성한다(mime: MimeType): Promise<string> {
        if (!mime) {
            throw new BadRequestException('Mime type is required');
        }
        return this.s3Service.generatePresignedUrl(mime);
    }

    // 파일 데이터 생성 관련 메서드들
    async 파일_데이터를_생성한다(createFileDataDto: CreateFileDataDto): Promise<File> {
        const fileName = createFileDataDto.filePath.split('/').pop();
        const fileExists = await this.s3Service.checkFileExists(fileName);

        if (!fileExists) {
            throw new BadRequestException('File not found in S3');
        }

        const file = await this.domainFileService.create({
            fileName,
            filePath: this.s3Service.getFileUrl(fileName),
        });
        return await this.domainFileService.save(file);
    }

    async 자원_파일을_조회한다(resourceId: string): Promise<{
        images: File[];
    }> {
        const resourceFiles = await this.domainFileResourceService.findAll({
            where: { resourceId },
        });

        const files = await this.domainFileService.findAll({
            where: { fileId: In(resourceFiles.map((file) => file.fileId)) },
        });
        return {
            images: files,
        };
    }

    /**
     * 차량정보의 파일들을 조회
     */
    async 차량정보_파일을_조회한다(vehicleInfoId: string): Promise<{
        parkingLocationImages: File[];
        odometerImages: File[];
        indoorImages: File[];
    }> {
        const fileVehicleInfos = await this.domainFileVehicleInfoService.findByVehicleInfoId(vehicleInfoId);

        const result = {
            parkingLocationImages: [],
            odometerImages: [],
            indoorImages: [],
        };

        // 타입별로 파일 ID 분류
        for (const fileVehicleInfo of fileVehicleInfos) {
            if (fileVehicleInfo.type === 'PARKING_LOCATION') {
                result.parkingLocationImages.push(fileVehicleInfo.fileId);
            } else if (fileVehicleInfo.type === 'ODOMETER') {
                result.odometerImages.push(fileVehicleInfo.fileId);
            } else if (fileVehicleInfo.type === 'INDOOR') {
                result.indoorImages.push(fileVehicleInfo.fileId);
            }
        }

        // 파일 ID로 실제 파일 정보 조회
        return {
            parkingLocationImages:
                result.parkingLocationImages.length > 0
                    ? await this.domainFileService.findAll({
                          where: { fileId: In(result.parkingLocationImages) },
                      })
                    : [],
            odometerImages:
                result.odometerImages.length > 0
                    ? await this.domainFileService.findAll({
                          where: { fileId: In(result.odometerImages) },
                      })
                    : [],
            indoorImages:
                result.indoorImages.length > 0
                    ? await this.domainFileService.findAll({
                          where: { fileId: In(result.indoorImages) },
                      })
                    : [],
        };
    }

    /**
     * 차량예약에 파일들을 연결한다 (히스토리성 - 기존 데이터 유지)
     */
    async 차량예약에_파일들을_연결한다(
        reservationVehicleId: string,
        files: {
            parkingLocationImages?: string[];
            odometerImages?: string[];
            indoorImages?: string[];
        },
        queryRunner?: any,
    ): Promise<void> {
        const options = queryRunner ? { queryRunner } : {};

        // 기존 연결 삭제하지 않음 (히스토리성 데이터)
        // 새로운 연결만 생성
        const connections = [];

        if (files.parkingLocationImages?.length > 0) {
            connections.push(
                ...files.parkingLocationImages.map((fileId) => ({
                    reservationVehicleId,
                    fileId,
                    type: 'PARKING_LOCATION',
                })),
            );
        }

        if (files.odometerImages?.length > 0) {
            connections.push(
                ...files.odometerImages.map((fileId) => ({
                    reservationVehicleId,
                    fileId,
                    type: 'ODOMETER',
                })),
            );
        }

        if (files.indoorImages?.length > 0) {
            connections.push(
                ...files.indoorImages.map((fileId) => ({
                    reservationVehicleId,
                    fileId,
                    type: 'INDOOR',
                })),
            );
        }

        // 중간테이블에 데이터 저장
        if (connections.length > 0) {
            await this.domainFileReservationVehicleService.saveMultiple(connections, options);
        }
    }

    /**
     * 파일들을 임시에서 영구로 변경한다
     */
    async 파일들을_영구로_변경한다(fileIds: string[], queryRunner?: any): Promise<void> {
        if (fileIds.length === 0) return;

        const options = queryRunner ? { queryRunner } : {};

        for (const fileId of fileIds) {
            await this.domainFileService.update(fileId, { isTemporary: false }, options);
        }
    }

    /**
     * 리소스에 파일들을 연결한다
     */
    async 리소스에_파일들을_연결한다(resourceId: string, fileIds: string[], queryRunner?: any): Promise<void> {
        if (fileIds.length === 0) return;

        const options = queryRunner ? { queryRunner } : {};

        // 기존 연결된 파일들 조회 후 임시 상태로 변경
        const existingConnections = await this.domainFileResourceService.findAll({
            where: { resourceId },
        });

        if (existingConnections.length > 0) {
            const existingFileIds = existingConnections.map((conn) => conn.fileId);
            // 기존 파일들을 임시 상태로 변경
            for (const fileId of existingFileIds) {
                await this.domainFileService.update(fileId, { isTemporary: true }, options);
            }
        }

        // 기존 연결 삭제
        await this.domainFileResourceService.deleteByResourceId(resourceId, options);

        // 새로운 연결 생성
        const connections = fileIds.map((fileId) => ({
            resourceId,
            fileId,
        }));

        // 중간테이블에 데이터 저장
        await this.domainFileResourceService.saveMultiple(connections, options);
    }

    /**
     * 차량정보에 파일들을 연결한다 (덮어쓰기)
     */
    async 차량정보에_파일들을_연결한다(
        vehicleInfoId: string,
        files: {
            parkingLocationImages?: string[];
            odometerImages?: string[];
            indoorImages?: string[];
        },
        queryRunner?: any,
    ): Promise<void> {
        const options = queryRunner ? { queryRunner } : {};

        // 기존 연결된 파일들 조회 후 임시 상태로 변경
        const existingConnections = await this.domainFileVehicleInfoService.findByVehicleInfoId(vehicleInfoId);

        if (existingConnections.length > 0) {
            const existingFileIds = existingConnections.map((conn) => conn.fileId);
            // 기존 파일들을 임시 상태로 변경
            for (const fileId of existingFileIds) {
                await this.domainFileService.update(fileId, { isTemporary: true }, options);
            }
        }

        // 기존 연결 삭제 (덮어쓰기)
        await this.domainFileVehicleInfoService.deleteByVehicleInfoId(vehicleInfoId, options);

        // 새로운 연결 생성
        const connections = [];

        if (files.parkingLocationImages?.length > 0) {
            connections.push(
                ...files.parkingLocationImages.map((fileId) => ({
                    vehicleInfoId,
                    fileId,
                    type: 'PARKING_LOCATION',
                })),
            );
        }

        if (files.odometerImages?.length > 0) {
            connections.push(
                ...files.odometerImages.map((fileId) => ({
                    vehicleInfoId,
                    fileId,
                    type: 'ODOMETER',
                })),
            );
        }

        if (files.indoorImages?.length > 0) {
            connections.push(
                ...files.indoorImages.map((fileId) => ({
                    vehicleInfoId,
                    fileId,
                    type: 'INDOOR',
                })),
            );
        }

        // 중간테이블에 데이터 저장
        if (connections.length > 0) {
            await this.domainFileVehicleInfoService.saveMultiple(connections, options);
        }
    }

    /**
     * 정비에 파일들을 연결한다 (덮어쓰기)
     */
    async 정비에_파일들을_연결한다(maintenanceId: string, fileIds: string[], queryRunner?: any): Promise<void> {
        const options = queryRunner ? { queryRunner } : {};

        // 기존 연결된 파일들 조회 후 임시 상태로 변경
        const existingConnections = await this.domainFileMaintenanceService.findByMaintenanceId(maintenanceId);

        if (existingConnections.length > 0) {
            const existingFileIds = existingConnections.map((conn) => conn.fileId);
            // 기존 파일들을 임시 상태로 변경
            for (const fileId of existingFileIds) {
                await this.domainFileService.update(fileId, { isTemporary: true }, options);
            }
        }

        // 기존 연결 삭제 (덮어쓰기)
        await this.domainFileMaintenanceService.deleteByMaintenanceId(maintenanceId, options);

        // 새로운 연결 생성
        const connections = fileIds.map((fileId) => ({
            maintenanceId,
            fileId,
        }));

        if (connections.length > 0) {
            await this.domainFileMaintenanceService.saveMultiple(connections, options);
        }
    }

    /**
     * 정비 파일을 조회한다
     */
    async 정비_파일을_조회한다(maintenanceId: string): Promise<{ filePath: string }[]> {
        const fileMaintenances = await this.domainFileMaintenanceService.findByMaintenanceId(maintenanceId);
        return fileMaintenances.map((fm) => ({
            filePath: fm.file.filePath,
        }));
    }

    /**
     * 정비 파일 정보를 조회한다 (FileResponseDto 형태로)
     */
    async 정비_파일정보를_조회한다(maintenanceId: string): Promise<any[]> {
        const fileMaintenances = await this.domainFileMaintenanceService.findByMaintenanceId(maintenanceId);
        return fileMaintenances.map((fm) => ({
            fileId: fm.file.fileId,
            fileName: fm.file.fileName,
            filePath: fm.file.filePath,
        }));
    }
}
