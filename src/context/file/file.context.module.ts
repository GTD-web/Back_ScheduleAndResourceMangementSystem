import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File, FileMaintenance, FileReservationVehicle, FileResource, FileVehicleInfo } from '../../../libs/entities';

// Domain Modules
import { DomainFileModule } from '../../domain/file/file.module';
import { DomainFileMaintenanceModule } from '../../domain/file-maintenance/file-maintenance.module';
import { DomainFileReservationVehicleModule } from '../../domain/file-reservation-vehicle/file-reservation-vehicle.module';
import { DomainFileResourceModule } from '../../domain/file-resource/file-resource.module';
import { DomainFileVehicleInfoModule } from '../../domain/file-vehicle-info/file-vehicle-info.module';
import { FileContextService } from './services/file.context.service';
import { S3Service } from './adapter/s3.service';

// Context Services

/**
 * 파일 관리 컨텍스트 모듈
 *
 * 이 모듈은 파일 관리에 관련된 모든 비즈니스 로직을 포함합니다:
 * - 파일 업로드, 다운로드, 삭제
 * - 파일과 다른 엔티티(유지보수, 차량, 리소스 등)의 연결 관리
 * - 파일 유효성 검증 (크기, 타입, 권한 등)
 * - 파일 첨부 관리
 *
 * 특징:
 * - 다양한 엔티티와의 파일 연결을 통합 관리
 * - 파일 타입별 분류 및 관리
 * - 파일 접근 권한 및 보안 검증
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([File, FileMaintenance, FileReservationVehicle, FileResource, FileVehicleInfo]),
        // Domain Layer Modules
        DomainFileModule,
        DomainFileMaintenanceModule,
        DomainFileReservationVehicleModule,
        DomainFileResourceModule,
        DomainFileVehicleInfoModule,
    ],
    controllers: [],
    providers: [
        // Context Services
        FileContextService,
        S3Service,
    ],
    exports: [
        // Context Services
        FileContextService,
    ],
})
export class FileContextModule {}
