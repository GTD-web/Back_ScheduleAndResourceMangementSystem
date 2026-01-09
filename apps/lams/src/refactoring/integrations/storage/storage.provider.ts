import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3StorageService } from '../s3-storage/s3-storage.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { IStorageService } from './storage.interface';

/**
 * 스토리지 서비스 프로바이더 팩토리
 *
 * 환경 변수 STORAGE_TYPE에 따라 S3StorageService 또는 LocalStorageService를 반환합니다.
 * - 's3' 또는 'S3': S3StorageService
 * - 'local' 또는 'LOCAL': LocalStorageService
 * - 기본값: 'local' (개발/테스트 환경)
 */
export const StorageServiceProvider: Provider<IStorageService> = {
    provide: 'IStorageService',
    useFactory: (
        configService: ConfigService,
        s3StorageService: S3StorageService,
        localStorageService: LocalStorageService,
    ): IStorageService => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'local').toLowerCase();

        if (storageType === 's3') {
            console.log('S3StorageService 사용');
            return s3StorageService;
        } else {
            console.log('LocalStorageService 사용');
            return localStorageService;
        }
    },
    inject: [ConfigService, S3StorageService, LocalStorageService],
};
