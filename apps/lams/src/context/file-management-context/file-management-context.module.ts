import { Module, DynamicModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileManagementContextService } from './file-management-context.service';
import { FILE_UPLOAD_HANDLERS, FILE_CONTENT_REFLECTION_HANDLERS, FILE_LIST_QUERY_HANDLERS } from './handlers';
import { S3StorageModule } from '../../integrations/s3-storage/s3-storage.module';
import { LocalStorageModule } from '../../integrations/local-storage/local-storage.module';
import { ExcelReaderModule } from '../../integrations/excel-reader/excel-reader.module';
import { DomainFileModule } from '../../domain/file/file.module';
import { DomainFileContentReflectionHistoryModule } from '../../domain/file-content-reflection-history/file-content-reflection-history.module';
import { DomainEventInfoModule } from '../../domain/event-info/event-info.module';
import { DomainUsedAttendanceModule } from '../../domain/used-attendance/used-attendance.module';
import { DomainAttendanceTypeModule } from '../../domain/attendance-type/attendance-type.module';
import { StorageServiceProvider } from '../../integrations/storage';
import { DomainDataSnapshotInfoModule } from '../../domain/data-snapshot-info/data-snapshot-info.module';

/**
 * 파일관리 컨텍스트 모듈
 *
 * CQRS 패턴을 사용하여 Command/Query Handler를 등록합니다.
 * STORAGE_TYPE 환경 변수에 따라 StorageServiceProvider가 적절한 스토리지 서비스를 선택합니다.
 */
@Module({})
export class FileManagementContextModule {
    static forRoot(): DynamicModule {
        return {
            module: FileManagementContextModule,
            imports: [
                CqrsModule, // CommandBus/QueryBus 제공
                ConfigModule,
                TypeOrmModule.forFeature([]),
                ExcelReaderModule,
                DomainFileModule,
                DomainFileContentReflectionHistoryModule,
                DomainEventInfoModule,
                DomainUsedAttendanceModule,
                DomainAttendanceTypeModule,
                DomainDataSnapshotInfoModule,
                // 두 스토리지 모듈을 모두 임포트 (StorageServiceProvider에서 환경 변수에 따라 선택)
                S3StorageModule,
                LocalStorageModule,
            ],
            providers: [
                FileManagementContextService,
                StorageServiceProvider, // 동적 스토리지 서비스 프로바이더
                ...FILE_UPLOAD_HANDLERS,
                ...FILE_CONTENT_REFLECTION_HANDLERS,
                ...FILE_LIST_QUERY_HANDLERS,
            ],
            exports: [FileManagementContextService],
        };
    }
}
