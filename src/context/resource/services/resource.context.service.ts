import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DataSource, In, IsNull, LessThan, MoreThan, Not } from 'typeorm';
import { ResourceType } from '../../../../libs/enums/resource-type.enum';
import { ERROR_MESSAGE } from '../../../../libs/constants/error-message';
import { Resource } from '../../../../libs/entities/resource.entity';
import { Consumable } from '../../../../libs/entities/consumable.entity';

// Domain Services
import { DomainResourceService } from '../../../domain/resource/resource.service';
import { DomainResourceGroupService } from '../../../domain/resource-group/resource-group.service';
import { DomainResourceManagerService } from '../../../domain/resource-manager/resource-manager.service';
import { DomainVehicleInfoService } from '../../../domain/vehicle-info/vehicle-info.service';
import { DomainMeetingRoomInfoService } from '../../../domain/meeting-room-info/meeting-room-info.service';
import { DomainAccommodationInfoService } from '../../../domain/accommodation-info/accommodation-info.service';
import { DomainEquipmentInfoService } from '../../../domain/equipment-info/equipment-info.service';
import { DomainFileService } from '../../../domain/file/file.service';
import { FileContextService } from '../../file/services/file.context.service';
import { ConsumableContextService } from './consumable.context.service';

// DTOs
import {
    ResourceResponseDto,
    CreateResourceResponseDto,
    MyManagementResourcesResponseDto,
    ResourceTypeGroupDto,
    ResourceGroupWithResourcesDto,
    ManagementResourceResponseDto,
    ManagementResourceTypeGroupDto,
    ManagementResourceGroupDto,
} from '../../../business/resource-management/dtos/resource/resource-response.dto';
import { CreateResourceInfoDto } from '../../../business/resource-management/dtos/resource/create-resource.dto';
import {
    UpdateResourceInfoDto,
    UpdateResourceOrdersDto,
} from '../../../business/resource-management/dtos/resource/update-resource.dto';
import { CheckAvailabilityQueryDto } from '../../../business/resource-management/dtos/resource/check-availability.dto';
import { ResourceAvailabilityDto } from '../../../business/resource-management/dtos/resource/available-time-response.dto';
import { UpdateVehicleInfoDto } from '../../../business/resource-management/dtos/vehicle/update-vehicle-info.dto';
import { UpdateMeetingRoomInfoDto } from '../../../business/resource-management/dtos/meeting-room/update-meeting-room-info.dto';
import { UpdateAccommodationInfoDto } from '../../../business/resource-management/dtos/accommodation/update-accommodation-info.dto';
import { UpdateEquipmentInfoDto } from '../../../business/resource-management/dtos/equipment/update-equipment-info.dto';
import { ReservationStatus } from '../../../../libs/enums/reservation-type.enum';
import { DomainConsumableService } from '../../../domain/consumable/consumable.service';

@Injectable()
export class ResourceContextService {
    constructor(
        private readonly domainResourceService: DomainResourceService,
        private readonly domainResourceGroupService: DomainResourceGroupService,
        private readonly domainResourceManagerService: DomainResourceManagerService,
        private readonly domainVehicleInfoService: DomainVehicleInfoService,
        private readonly domainMeetingRoomInfoService: DomainMeetingRoomInfoService,
        private readonly domainAccommodationInfoService: DomainAccommodationInfoService,
        private readonly domainEquipmentInfoService: DomainEquipmentInfoService,
        private readonly domainConsumableService: DomainConsumableService,
        private readonly domainFileService: DomainFileService,
        private readonly fileContextService: FileContextService,
        private readonly consumableContextService: ConsumableContextService,
        private readonly dataSource: DataSource,
    ) {}

    async 자원_목록을_조회한다(type: ResourceType): Promise<ResourceResponseDto[]> {
        let relations: string[] = [];
        if (type === ResourceType.VEHICLE) {
            relations = ['vehicleInfo', 'vehicleInfo.consumables'];
        } else if (type === ResourceType.MEETING_ROOM) {
            relations = ['meetingRoomInfo'];
        } else if (type === ResourceType.ACCOMMODATION) {
            relations = ['accommodationInfo'];
        } else if (type === ResourceType.EQUIPMENT) {
            relations = ['equipmentInfo'];
        }

        const resources = await this.domainResourceService.findAll({
            where: { type: type },
            relations: relations,
        });

        // 각 자원에 대해 파일 정보 추가
        const resourcesWithFiles = await Promise.all(
            resources.map(async (resource) => {
                const resourceFiles = await this.fileContextService.자원_파일을_조회한다(resource.resourceId);
                (resource as any).imageFiles = resourceFiles.images;
                return resource;
            }),
        );

        return resourcesWithFiles.map((resource) => new ResourceResponseDto(resource));
    }

    async 소모품의_자원을_조회한다(consumableId: string): Promise<Consumable> {
        const consumable = await this.domainConsumableService.findOne({
            where: {
                consumableId: consumableId,
            },
            relations: ['vehicleInfo', 'vehicleInfo.resource'],
        });
        return consumable;
    }

    async 자원과_상세정보를_생성한다(createResourceInfo: CreateResourceInfoDto): Promise<CreateResourceResponseDto> {
        const { resource, typeInfo, managers } = createResourceInfo;

        if (!resource.resourceGroupId) {
            throw new BadRequestException(ERROR_MESSAGE.BUSINESS.RESOURCE.GROUP_ID_REQUIRED);
        }

        if (!managers || managers.length === 0) {
            throw new BadRequestException(ERROR_MESSAGE.BUSINESS.RESOURCE.MANAGERS_REQUIRED);
        }

        const group = await this.domainResourceGroupService.findOne({
            where: { resourceGroupId: resource.resourceGroupId },
        });

        if (!group) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.RESOURCE_GROUP.NOT_FOUND);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const resources = await this.domainResourceService.findAll({
                where: { resourceGroupId: group.resourceGroupId },
            });
            const resourceOrder = resources.length;

            // 파일 ID 배열 준비 (기본값 빈 배열)
            if (!resource.images) resource.images = [];
            const fileIds = resource.images; // 원본 파일 ID 배열 보존

            // 파일 ID들을 filePath로 변환
            let filePaths: string[] = [];
            if (fileIds.length > 0) {
                const files = await this.domainFileService.findAll({
                    where: { fileId: In(fileIds) },
                });
                filePaths = files.map((file) => file.filePath);
            }

            const savedResource = await this.domainResourceService.save(
                { ...resource, images: filePaths, order: resourceOrder } as Resource,
                { queryRunner },
            );

            // 파일들을 임시에서 영구로 변경
            if (fileIds.length > 0) {
                await this.fileContextService.파일들을_영구로_변경한다(fileIds, queryRunner);
            }

            // 리소스에 파일들을 연결
            await this.fileContextService.리소스에_파일들을_연결한다(savedResource.resourceId!, fileIds, queryRunner);

            switch (group.type) {
                case ResourceType.VEHICLE:
                    // 차량정보의 파일 ID들을 filePath로 변환
                    const vehicleTypeInfo = typeInfo as any;
                    const vehicleFilePaths = {
                        parkingLocationImages: [] as string[],
                        odometerImages: [] as string[],
                        indoorImages: [] as string[],
                    };

                    if (vehicleTypeInfo.parkingLocationImages?.length > 0) {
                        const files = await this.domainFileService.findAll({
                            where: { fileId: In(vehicleTypeInfo.parkingLocationImages) },
                        });
                        vehicleFilePaths.parkingLocationImages = files.map((file) => file.filePath);
                    }

                    if (vehicleTypeInfo.odometerImages?.length > 0) {
                        const files = await this.domainFileService.findAll({
                            where: { fileId: In(vehicleTypeInfo.odometerImages) },
                        });
                        vehicleFilePaths.odometerImages = files.map((file) => file.filePath);
                    }

                    if (vehicleTypeInfo.indoorImages?.length > 0) {
                        const files = await this.domainFileService.findAll({
                            where: { fileId: In(vehicleTypeInfo.indoorImages) },
                        });
                        vehicleFilePaths.indoorImages = files.map((file) => file.filePath);
                    }

                    const savedVehicleInfo = await this.domainVehicleInfoService.save(
                        {
                            ...typeInfo,
                            ...vehicleFilePaths,
                            resourceId: savedResource.resourceId,
                        },
                        { queryRunner },
                    );

                    // 차량정보에 파일들을 연결 (중간테이블)
                    if (
                        vehicleTypeInfo.parkingLocationImages?.length > 0 ||
                        vehicleTypeInfo.odometerImages?.length > 0 ||
                        vehicleTypeInfo.indoorImages?.length > 0
                    ) {
                        await this.fileContextService.차량정보에_파일들을_연결한다(
                            savedVehicleInfo.vehicleInfoId,
                            {
                                parkingLocationImages: vehicleTypeInfo.parkingLocationImages || [],
                                odometerImages: vehicleTypeInfo.odometerImages || [],
                                indoorImages: vehicleTypeInfo.indoorImages || [],
                            },
                            queryRunner,
                        );
                    }
                    break;
                case ResourceType.MEETING_ROOM:
                    await this.domainMeetingRoomInfoService.save(
                        { ...typeInfo, resourceId: savedResource.resourceId },
                        { queryRunner },
                    );
                    break;
                case ResourceType.ACCOMMODATION:
                    await this.domainAccommodationInfoService.save(
                        { ...typeInfo, resourceId: savedResource.resourceId },
                        { queryRunner },
                    );
                    break;
                case ResourceType.EQUIPMENT:
                    await this.domainEquipmentInfoService.save(
                        { ...typeInfo, resourceId: savedResource.resourceId },
                        { queryRunner },
                    );
                    break;
            }

            await Promise.all([
                ...managers.map((manager) => {
                    return this.domainResourceManagerService.save(
                        {
                            resourceId: savedResource.resourceId,
                            employeeId: manager.employeeId,
                        },
                        { queryRunner },
                    );
                }),
            ]);

            await queryRunner.commitTransaction();

            const resourceWithTypeInfo = await this.domainResourceService.findOne({
                where: { resourceId: savedResource.resourceId },
                relations: ['vehicleInfo', 'meetingRoomInfo', 'accommodationInfo', 'equipmentInfo'],
            });

            return {
                resourceId: resourceWithTypeInfo.resourceId,
                type: resourceWithTypeInfo.type,
                typeInfoId:
                    resourceWithTypeInfo.vehicleInfo?.vehicleInfoId ||
                    resourceWithTypeInfo.meetingRoomInfo?.meetingRoomInfoId ||
                    resourceWithTypeInfo.accommodationInfo?.accommodationInfoId ||
                    resourceWithTypeInfo.equipmentInfo?.equipmentInfoId,
            };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(ERROR_MESSAGE.BUSINESS.RESOURCE.FAILED_CREATE);
        } finally {
            await queryRunner.release();
        }
    }

    async 자원정보를_조회한다(resourceId: string): Promise<ResourceResponseDto> {
        return this.자원_상세정보를_조회한다(resourceId);
    }

    async 자원_상세정보를_조회한다(resourceId: string): Promise<ResourceResponseDto> {
        const resource = await this.domainResourceService.findOne({
            where: { resourceId },
            relations: [
                'vehicleInfo',
                'meetingRoomInfo',
                'accommodationInfo',
                'equipmentInfo',
                'resourceManagers',
                'resourceManagers.employee',
                'resourceGroup',
            ],
        });

        if (!resource) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.RESOURCE.NOT_FOUND);
        }

        // 자원과 연결된 파일 정보 조회
        const resourceFiles = await this.fileContextService.자원_파일을_조회한다(resourceId);

        // 리소스 객체에 파일 정보 추가
        resource.images = resourceFiles.images.map((file) => file.filePath);

        return new ResourceResponseDto(resource);
    }

    async 그룹별_자원_목록을_조회한다(resourceGroupId: string): Promise<ResourceResponseDto[]> {
        const resources = await this.domainResourceService.findAll({
            where: { resourceGroupId },
            relations: ['vehicleInfo', 'meetingRoomInfo', 'accommodationInfo', 'equipmentInfo'],
            order: { order: 'ASC' },
        });

        // 각 자원에 대해 파일 정보 추가
        const resourcesWithFiles = await Promise.all(
            resources.map(async (resource) => {
                const resourceFiles = await this.fileContextService.자원_파일을_조회한다(resource.resourceId);
                resource.images = resourceFiles.images.map((file) => file.filePath);
                return resource;
            }),
        );

        return resourcesWithFiles.map((resource) => new ResourceResponseDto(resource));
    }

    async 자원을_수정한다(
        resourceId: string,
        updateResourceInfoDto: UpdateResourceInfoDto,
    ): Promise<ResourceResponseDto> {
        const resource = await this.domainResourceService.findOne({
            where: {
                resourceId: resourceId,
            },
            relations: ['resourceGroup'],
        });

        if (!resource) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.RESOURCE.NOT_FOUND);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (updateResourceInfoDto.resource) {
                // 리소스 정보 업데이트 (이미지 제외)
                const { images } = updateResourceInfoDto.resource;

                // 이미지가 변경된 경우 파일 연결 처리
                if (images !== undefined) {
                    // 파일 ID 배열 준비 (기본값 빈 배열)
                    const fileIds = images || [];

                    // 파일 ID들을 filePath로 변환
                    let filePaths: string[] = [];
                    if (fileIds.length > 0) {
                        const files = await this.domainFileService.findAll({
                            where: { fileId: In(fileIds) },
                        });
                        filePaths = files.map((file) => file.filePath);
                        updateResourceInfoDto.resource.images = filePaths;
                    }

                    // 파일들을 임시에서 영구로 변경
                    if (fileIds.length > 0) {
                        await this.fileContextService.파일들을_영구로_변경한다(fileIds, queryRunner);
                    }

                    // 리소스에 파일들을 연결 (기존 연결 삭제 후 새로 생성)
                    await this.fileContextService.리소스에_파일들을_연결한다(resourceId, fileIds, queryRunner);
                }
                // 리소스의 images 컬럼에 filePath 배열 저장
                await this.domainResourceService.update(resourceId, updateResourceInfoDto.resource, { queryRunner });
            }

            if (updateResourceInfoDto.typeInfo) {
                switch (resource.type) {
                    case ResourceType.VEHICLE:
                        const vehicleInfo = updateResourceInfoDto.typeInfo as UpdateVehicleInfoDto;
                        await this.domainVehicleInfoService.update(vehicleInfo.vehicleInfoId, vehicleInfo, {
                            queryRunner,
                        });
                        break;
                    case ResourceType.MEETING_ROOM:
                        const meetingRoomInfo = updateResourceInfoDto.typeInfo as UpdateMeetingRoomInfoDto;
                        await this.domainMeetingRoomInfoService.update(
                            meetingRoomInfo.meetingRoomInfoId,
                            meetingRoomInfo,
                            {
                                queryRunner,
                            },
                        );
                        break;
                    case ResourceType.ACCOMMODATION:
                        const accommodationInfo = updateResourceInfoDto.typeInfo as UpdateAccommodationInfoDto;
                        await this.domainAccommodationInfoService.update(
                            accommodationInfo.accommodationInfoId,
                            accommodationInfo,
                            {
                                queryRunner,
                            },
                        );
                        break;
                    case ResourceType.EQUIPMENT:
                        const equipmentInfo = updateResourceInfoDto.typeInfo as UpdateEquipmentInfoDto;
                        await this.domainEquipmentInfoService.update(equipmentInfo.equipmentInfoId, equipmentInfo, {
                            queryRunner,
                        });
                        break;
                }
            }
            if (updateResourceInfoDto.managers) {
                const newManagerIds = updateResourceInfoDto.managers.map((m) => m.employeeId);
                const currentManagers = await this.domainResourceManagerService.findAll({
                    where: {
                        resourceId: resourceId,
                    },
                });
                const currentManagerIds = currentManagers.map((m) => m.employeeId);

                // 삭제될 관리자 처리
                const managersToRemove = currentManagers.filter(
                    (manager) => !newManagerIds.includes(manager.employeeId),
                );
                await Promise.all(
                    managersToRemove.map((manager) =>
                        this.domainResourceManagerService.delete(manager.resourceManagerId, { queryRunner }),
                    ),
                );

                // 새로 추가될 관리자 처리
                const managersToAdd = newManagerIds.filter((employeeId) => !currentManagerIds.includes(employeeId));
                await Promise.all(
                    managersToAdd.map((employeeId) =>
                        this.domainResourceManagerService.save({ resourceId, employeeId }, { queryRunner }),
                    ),
                );
            }

            await queryRunner.commitTransaction();

            return this.자원_상세정보를_조회한다(resourceId);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(ERROR_MESSAGE.BUSINESS.RESOURCE.FAILED_UPDATE);
        } finally {
            await queryRunner.release();
        }
    }

    async 자원_순서를_변경한다(updateResourceOrdersDto: UpdateResourceOrdersDto): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await Promise.all(
                updateResourceOrdersDto.orders.map((order) =>
                    this.domainResourceService.update(order.resourceId, { order: order.newOrder }, { queryRunner }),
                ),
            );

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async 자원을_삭제한다(resourceId: string): Promise<void> {
        const resource = await this.domainResourceService.findOne({
            where: {
                resourceId: resourceId,
            },
        });
        if (!resource) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.RESOURCE.NOT_FOUND);
        }
        if (resource.isAvailable) {
            throw new BadRequestException(ERROR_MESSAGE.BUSINESS.RESOURCE.IS_AVAILABLE);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await this.domainResourceService.update(resourceId, { resourceGroupId: null }, { queryRunner });

            const resourceManagers = await this.domainResourceManagerService.findAll({
                where: {
                    resourceId: resourceId,
                },
            });
            for (const manager of resourceManagers) {
                await this.domainResourceManagerService.delete(manager.resourceManagerId, { queryRunner });
            }

            await this.domainResourceService.softDelete(resourceId, { queryRunner });

            const resources = await this.domainResourceService.findAll({
                where: {
                    resourceId: Not(resourceId),
                    resourceGroupId: resource.resourceGroupId,
                    deletedAt: IsNull(),
                },
                order: {
                    order: 'ASC',
                },
            });

            for (let i = 0; i < resources.length; i++) {
                await this.domainResourceService.update(resources[i].resourceId, { order: i }, { queryRunner });
            }

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(ERROR_MESSAGE.BUSINESS.RESOURCE.FAILED_DELETE);
        } finally {
            await queryRunner.release();
        }

        // const resource = await this.domainResourceService.findOne({
        //     where: { resourceId },
        // });

        // if (!resource) {
        //     throw new NotFoundException(ERROR_MESSAGE.BUSINESS.RESOURCE.NOT_FOUND);
        // }

        // await this.domainResourceService.delete(resourceId);
    }

    /**
     * 자원 타입 라벨 반환
     */
    자원타입_라벨을_가져온다(type: string): string {
        switch (type) {
            case 'MEETING_ROOM':
                return '회의실';
            case 'VEHICLE':
                return '차량';
            case 'ACCOMMODATION':
                return '숙소';
            case 'EQUIPMENT':
                return '장비';
            default:
                return type;
        }
    }

    // ==================== 태스크 관련 메서드들 ====================

    /**
     * 관리자별 자원을 소모품 정보와 함께 조회한다
     */
    async 관리자별_자원을_소모품정보와_함께_조회한다(employeeId: string, isSystemAdmin: boolean): Promise<any[]> {
        const resources = await this.domainResourceService.findAll({
            where: {
                ...(isSystemAdmin ? {} : { resourceManagers: { employeeId: employeeId } }),
            },
            relations: [
                'resourceManagers',
                'vehicleInfo',
                'vehicleInfo.consumables',
                'vehicleInfo.consumables.maintenances',
            ],
            order: {
                vehicleInfo: {
                    consumables: {
                        maintenances: {
                            date: 'DESC',
                        },
                    },
                },
            },
        });

        return resources;
    }

    /**
     * 소모품 정보와 함께 모든 자원을 조회한다
     */
    async 소모품정보와_함께_모든자원을_조회한다(): Promise<any[]> {
        const resources = await this.domainResourceService.findAll({
            relations: [
                'resourceManagers',
                'resourceManagers.employee',
                'vehicleInfo',
                'vehicleInfo.consumables',
                'vehicleInfo.consumables.maintenances',
            ],
            order: {
                vehicleInfo: {
                    consumables: {
                        maintenances: {
                            date: 'DESC',
                        },
                    },
                },
            },
        });

        return resources;
    }

    /**
     * 자원 타입별 상세 정보를 조회한다
     */
    async 자원의_타입별_상세정보를_조회한다(resource: Resource): Promise<any> {
        switch (resource.type) {
            case ResourceType.VEHICLE:
                const vehicleInfo = await this.domainVehicleInfoService.findOne({
                    where: { resourceId: resource.resourceId },
                });
                return vehicleInfo;

            case ResourceType.MEETING_ROOM:
                return await this.domainMeetingRoomInfoService.findOne({
                    where: { resourceId: resource.resourceId },
                });

            case ResourceType.ACCOMMODATION:
                return await this.domainAccommodationInfoService.findOne({
                    where: { resourceId: resource.resourceId },
                });

            case ResourceType.EQUIPMENT:
                return await this.domainEquipmentInfoService.findOne({
                    where: { resourceId: resource.resourceId },
                });

            default:
                return null;
        }
    }

    /**
     * 자원 타입별 운영 시간 규칙을 가져온다
     */
    자원_타입별_운영시간_규칙을_가져온다(resourceType: ResourceType): {
        startTime: string;
        endTime: string;
        is24Hour: boolean;
    } {
        switch (resourceType) {
            case ResourceType.VEHICLE:
                return { startTime: '00:00:00', endTime: '24:00:00', is24Hour: true };
            case ResourceType.MEETING_ROOM:
                return { startTime: '09:00:00', endTime: '18:00:00', is24Hour: false };
            case ResourceType.EQUIPMENT:
                return { startTime: '09:00:00', endTime: '18:00:00', is24Hour: false };
            case ResourceType.ACCOMMODATION:
                return { startTime: '00:00:00', endTime: '24:00:00', is24Hour: true };
            default:
                return { startTime: '09:00:00', endTime: '18:00:00', is24Hour: false };
        }
    }

    /**
     * 자원 그룹별로 사용 가능한 자원 목록을 조회한다
     */
    async 그룹별_사용가능한_자원_목록을_조회한다(
        resourceGroupId?: string,
        resourceType?: ResourceType,
    ): Promise<Resource[]> {
        const whereCondition: any = {
            isAvailable: true,
        };

        if (resourceGroupId) {
            whereCondition.resourceGroupId = resourceGroupId;
        }

        if (resourceType) {
            whereCondition.type = resourceType;
        }

        return await this.domainResourceService.findAll({
            where: whereCondition,
            relations: ['resourceGroup'],
            order: { order: 'ASC' },
        });
    }

    /**
     * 현재 시간 기준으로 자원별 가용 시간대를 계산한다
     */
    현재시간_기준_가용시간대를_계산한다(
        resourceType: ResourceType,
        isToday: boolean,
        startTime?: string,
        endTime?: string,
    ): { startTime: string; endTime: string } {
        const operatingHours = this.자원_타입별_운영시간_규칙을_가져온다(resourceType);

        if (!isToday) {
            if (startTime && endTime) {
                return { startTime: startTime, endTime: endTime };
            }
            return operatingHours;
        }

        // 오늘인 경우 현재 시간의 30분 단위로 올림하여 시작 시간 계산
        const now = new Date();
        const currentMinutes = now.getMinutes();
        const roundedStartTime = new Date(now);

        if (currentMinutes < 30) {
            roundedStartTime.setMinutes(0, 0, 0);
        } else {
            roundedStartTime.setMinutes(30, 0, 0);
        }
        const operatingStartTime = startTime ? startTime : operatingHours.startTime;
        const currentHours = roundedStartTime.getUTCHours() + 9;
        const currentStartTime = `${currentHours.toString().padStart(2, '0')}:${roundedStartTime.getMinutes().toString().padStart(2, '0')}:00`;
        // if (currentStartTime > operatingStartTime) {
        //     operatingStartTime = `${roundedStartTime.getHours().toString().padStart(2, '0')}:${roundedStartTime.getMinutes().toString().padStart(2, '0')}:00`;
        // }
        // roundedStartTime > new Date(operatingStartTime)
        //     ?
        //     : operatingStartTime.toTimeString().slice(0, 8);
        // if (resourceType === ResourceType.VEHICLE) {
        //     calculatedStartTime = roundedStartTime.toTimeString().slice(0, 8);
        // } else {

        // }
        return {
            startTime: currentStartTime > operatingStartTime ? currentStartTime : operatingStartTime,
            endTime: endTime ? endTime : operatingHours.endTime,
        };
    }

    async 자원의_해당시간_예약을_확인한다(
        resourceId: string,
        startDate: string,
        endDate: string,
        reservationId?: string,
    ): Promise<boolean> {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        const resource = await this.domainResourceService.findOne({
            where: {
                resourceId: resourceId,
                reservations: {
                    reservationId: reservationId ? Not(reservationId) : undefined,
                    status: Not(In([ReservationStatus.CANCELLED, ReservationStatus.REJECTED])),
                    startDate: LessThan(endDateObj),
                    endDate: MoreThan(startDateObj),
                },
            },
            relations: ['reservations'],
        });

        return !!resource;
    }

    /**
     * 내가 관리하는 자원목록을 조회한다
     */
    async 내가_관리하는_자원목록을_조회한다(employeeId: string): Promise<ManagementResourceResponseDto[]> {
        // 기본 자원 정보만 조회 (relations 최소화)
        const resources = await this.domainResourceService.findAll({
            where: { resourceManagers: { employeeId: employeeId } },
            // relations: ['resourceGroup'],
            select: {
                resourceId: true,
                resourceGroupId: true,
                name: true,
                type: true,
                order: true,
            },
            order: { order: 'ASC' },
        });

        // 타입별로 자원 그룹화 (성능 최적화)
        const resourcesByType = resources.reduce(
            (acc, resource) => {
                if (!acc[resource.type]) {
                    acc[resource.type] = [];
                }
                acc[resource.type].push(resource);
                return acc;
            },
            {} as Record<ResourceType, any[]>,
        );

        // 타입별로 일괄 조회
        const [vehicleInfos, meetingRoomInfos, accommodationInfos, equipmentInfos] = await Promise.all([
            // 차량 정보 일괄 조회
            resourcesByType[ResourceType.VEHICLE]?.length > 0
                ? this.domainVehicleInfoService.findAll({
                      where: {
                          resourceId: In(resourcesByType[ResourceType.VEHICLE].map((r) => r.resourceId)),
                      },
                  })
                : [],
            // 회의실 정보 일괄 조회
            resourcesByType[ResourceType.MEETING_ROOM]?.length > 0
                ? this.domainMeetingRoomInfoService.findAll({
                      where: {
                          resourceId: In(resourcesByType[ResourceType.MEETING_ROOM].map((r) => r.resourceId)),
                      },
                  })
                : [],
            // 숙박시설 정보 일괄 조회
            resourcesByType[ResourceType.ACCOMMODATION]?.length > 0
                ? this.domainAccommodationInfoService.findAll({
                      where: {
                          resourceId: In(resourcesByType[ResourceType.ACCOMMODATION].map((r) => r.resourceId)),
                      },
                  })
                : [],
            // 장비 정보 일괄 조회
            resourcesByType[ResourceType.EQUIPMENT]?.length > 0
                ? this.domainEquipmentInfoService.findAll({
                      where: {
                          resourceId: In(resourcesByType[ResourceType.EQUIPMENT].map((r) => r.resourceId)),
                      },
                  })
                : [],
        ]);

        // 소모품 정보 일괄 조회 (차량이 있는 경우에만)
        let allConsumables = [];
        if (vehicleInfos.length > 0) {
            allConsumables = await this.domainConsumableService.findAll({
                where: {
                    vehicleInfoId: In(vehicleInfos.map((v) => v.vehicleInfoId)),
                },
                relations: ['maintenances'],
                order: { name: 'ASC' },
            });
        }

        // 각 자원에 대해 매핑 및 추가 정보 처리
        const resourcesWithAdditionalInfo = await Promise.all(
            resources.map(async (resource) => {
                // 타입별 정보 매핑
                if (resource.type === ResourceType.VEHICLE) {
                    const vehicleInfo = vehicleInfos.find((v) => v.resourceId === resource.resourceId);
                    if (vehicleInfo) {
                        // resource.vehicleInfo = vehicleInfo;

                        // 해당 차량의 소모품 찾기
                        const vehicleConsumables = allConsumables.filter(
                            (c) => c.vehicleInfoId === vehicleInfo.vehicleInfoId,
                        );

                        if (vehicleConsumables.length > 0) {
                            // 소모품 교체 필요 여부 계산
                            vehicleInfo.consumables = vehicleConsumables;
                            const consumableResults =
                                await this.consumableContextService.차량_소모품들의_교체필요여부를_계산한다(
                                    vehicleInfo,
                                );

                            // 교체 필요한 소모품 이름들만 추출
                            const replacementRequiredConsumables = consumableResults
                                .filter((result) => result.isReplacementRequired)
                                .map((result) => result.consumable.name);

                            // resource 레벨에 계산 결과만 저장
                            resource['isReplacementRequired'] = replacementRequiredConsumables.length > 0;
                            resource['replacementRequiredConsumables'] = replacementRequiredConsumables;
                        } else {
                            // 차량이지만 소모품이 없는 경우
                            resource['isReplacementRequired'] = false;
                            resource['replacementRequiredConsumables'] = [];
                        }
                    } else {
                        // 차량이지만 vehicleInfo가 없는 경우
                        resource['isReplacementRequired'] = false;
                        resource['replacementRequiredConsumables'] = [];
                    }
                } else if (resource.type === ResourceType.MEETING_ROOM) {
                    const meetingRoomInfo = meetingRoomInfos.find((m) => m.resourceId === resource.resourceId);
                    if (meetingRoomInfo) {
                        resource.meetingRoomInfo = meetingRoomInfo;
                    }
                } else if (resource.type === ResourceType.ACCOMMODATION) {
                    const accommodationInfo = accommodationInfos.find((a) => a.resourceId === resource.resourceId);
                    if (accommodationInfo) {
                        resource.accommodationInfo = accommodationInfo;
                    }
                } else if (resource.type === ResourceType.EQUIPMENT) {
                    const equipmentInfo = equipmentInfos.find((e) => e.resourceId === resource.resourceId);
                    if (equipmentInfo) {
                        resource.equipmentInfo = equipmentInfo;
                    }
                }

                return resource;
            }),
        );

        return resourcesWithAdditionalInfo.map((resource) => new ManagementResourceResponseDto(resource));
    }

    /**
     * 자원들을 그룹별로 분류한다
     */
    async 자원들을_그룹별로_분류한다(
        resources: ManagementResourceResponseDto[],
    ): Promise<Record<string, ManagementResourceResponseDto[]>> {
        const groupedResources: Record<string, ManagementResourceResponseDto[]> = {};

        for (const resource of resources) {
            const groupId = resource.resourceGroupId || 'NO_GROUP';

            if (!groupedResources[groupId]) {
                groupedResources[groupId] = [];
            }

            groupedResources[groupId].push(resource);
        }

        return groupedResources;
    }

    /**
     * 그룹들을 그룹타입별로 분류한다
     */
    async 그룹들을_그룹타입별로_분류한다(
        groupedResources: Record<string, ManagementResourceResponseDto[]>,
    ): Promise<Record<string, Record<string, ManagementResourceResponseDto[]>>> {
        const typeGroupedResources: Record<string, Record<string, ManagementResourceResponseDto[]>> = {};

        // 그룹 ID들을 수집
        const groupIds = Object.keys(groupedResources).filter((id) => id !== 'NO_GROUP');

        // 그룹 정보들을 조회
        const resourceGroups = await this.domainResourceGroupService.findAll({
            where: { resourceGroupId: In(groupIds) },
            select: {
                resourceGroupId: true,
                title: true,
                type: true,
                order: true,
                parentResourceGroupId: true,
            },
        });

        // 각 그룹에 대해 타입별로 분류
        for (const [groupId, resources] of Object.entries(groupedResources)) {
            if (groupId === 'NO_GROUP') {
                // 그룹이 없는 자원들은 개별 타입으로 처리
                for (const resource of resources) {
                    const resourceType = resource.type;
                    if (!typeGroupedResources[resourceType]) {
                        typeGroupedResources[resourceType] = {};
                    }
                    typeGroupedResources[resourceType]['NO_GROUP'] = resources.filter((r) => r.type === resourceType);
                }
            } else {
                const resourceGroup = resourceGroups.find((group) => group.resourceGroupId === groupId);
                const groupType = resourceGroup?.type || ResourceType.VEHICLE;

                if (!typeGroupedResources[groupType]) {
                    typeGroupedResources[groupType] = {};
                }

                typeGroupedResources[groupType][groupId] = resources;
            }
        }

        return typeGroupedResources;
    }

    /**
     * 타입그룹을 계층구조로 변환한다
     */
    async 타입그룹_계층구조로_변환한다(
        typeGroupedResources: Record<string, Record<string, ManagementResourceResponseDto[]>>,
    ): Promise<MyManagementResourcesResponseDto> {
        const resourcesByType: ManagementResourceTypeGroupDto[] = [];

        for (const [resourceType, groupsByType] of Object.entries(typeGroupedResources)) {
            const groups: ManagementResourceGroupDto[] = [];
            let ungroupedResources: ManagementResourceResponseDto[] = [];

            // 그룹별로 처리
            for (const [groupId, resources] of Object.entries(groupsByType)) {
                if (groupId === 'NO_GROUP') {
                    ungroupedResources = resources;
                } else {
                    // 그룹 정보 조회
                    const resourceGroup = await this.domainResourceGroupService.findOne({
                        where: { resourceGroupId: groupId },
                    });

                    if (resourceGroup) {
                        const groupWithResources: ManagementResourceGroupDto = {
                            resourceGroupId: resourceGroup.resourceGroupId,
                            title: resourceGroup.title,
                            description: resourceGroup.description,
                            type: resourceGroup.type,
                            order: resourceGroup.order,
                            parentResourceGroupId: resourceGroup.parentResourceGroupId,
                            resources: resources,
                        };

                        groups.push(groupWithResources);
                    }
                }
            }

            // 그룹들을 order 순으로 정렬
            groups.sort((a, b) => a.order - b.order);

            const typeGroup: ManagementResourceTypeGroupDto = {
                type: resourceType as ResourceType,
                groups: groups.length > 0 ? groups : undefined,
                ungroupedResources: ungroupedResources.length > 0 ? ungroupedResources : undefined,
            };

            resourcesByType.push(typeGroup);
        }

        // 타입별로 정렬 (VEHICLE, MEETING_ROOM, ACCOMMODATION, EQUIPMENT 순)
        const typeOrder = [
            ResourceType.VEHICLE,
            ResourceType.MEETING_ROOM,
            ResourceType.ACCOMMODATION,
            ResourceType.EQUIPMENT,
        ];
        resourcesByType.sort((a, b) => {
            const indexA = typeOrder.indexOf(a.type);
            const indexB = typeOrder.indexOf(b.type);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

        return {
            resourcesByType,
        };
    }
}
