import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { File } from '@libs/entities';
import { FileService } from '@resource/modules/file/application/services/file.service';
import { FileRepository } from '@resource/modules/file/infrastructure/adapters/out/persistence/file.repository';
import { getTestDbConfig, closeTestContainer } from '../test-db.config';
import { MockStorageAdapter } from './mock/mock-storage.adapter';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

jest.setTimeout(30000); // Increase timeout to 30 seconds
const NON_EXISTENT_UUID = uuidv4();
describe('File Service Integration Test', () => {
    let moduleRef: TestingModule;
    let fileService: FileService;
    let mockStorage: MockStorageAdapter;
    const TEST_ID = 'file-service-test';

    beforeAll(async () => {
        const dbConfig = await getTestDbConfig(TEST_ID);
        mockStorage = new MockStorageAdapter();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                }),
                TypeOrmModule.forRoot({
                    ...dbConfig,
                    autoLoadEntities: true,
                }),
                TypeOrmModule.forFeature([File]),
            ],
            providers: [
                FileService,
                ConfigService,
                {
                    provide: 'FileRepositoryPort',
                    useClass: FileRepository,
                },
                {
                    provide: 'FileStoragePort',
                    useValue: mockStorage,
                },
            ],
        }).compile();

        fileService = moduleRef.get<FileService>(FileService);
    });

    afterAll(async () => {
        await moduleRef.close();
        await closeTestContainer(TEST_ID);
    });

    describe('uploadFile', () => {
        it('should upload file and save metadata', async () => {
            const mockFile: Express.Multer.File = {
                fieldname: 'file',
                originalname: 'test.txt',
                encoding: '7bit',
                mimetype: 'text/plain',
                size: 1024,
                destination: '',
                filename: 'test.txt',
                path: '',
                buffer: Buffer.from('test content'),
                stream: null,
            };

            const result = await fileService.uploadFile(mockFile);

            expect(result).toBeDefined();
            expect(result.fileName).toBe('test.txt');
            expect(result.filePath).toContain('test-files/');
            expect(result.filePath).toContain('test.txt');

            // Verify file is stored in mock storage
            expect(mockStorage.getStoredFile(result.filePath)).toBeDefined();
        });
    });

    describe('findFileById', () => {
        let savedFile: File;

        beforeAll(async () => {
            // Upload a file first
            const mockFile: Express.Multer.File = {
                fieldname: 'file',
                originalname: 'test-find.txt',
                encoding: '7bit',
                mimetype: 'text/plain',
                size: 512,
                destination: '',
                filename: 'test-find.txt',
                path: '',
                buffer: Buffer.from('test content for find'),
                stream: null,
            };

            savedFile = await fileService.uploadFile(mockFile);
        });

        it('should find file by id', async () => {
            const found = await fileService.findFileById(savedFile.fileId);
            expect(found).toBeDefined();
            expect(found.fileId).toBe(savedFile.fileId);
            expect(found.fileName).toBe('test-find.txt');
        });

        it('should return null for non-existent file id', async () => {
            const found = await fileService.findFileById(NON_EXISTENT_UUID);
            expect(found).toBeNull();
        });
    });

    describe('deleteFile', () => {
        let fileToDelete: File;

        beforeEach(async () => {
            // Upload a new file before each test
            const mockFile: Express.Multer.File = {
                fieldname: 'file',
                originalname: 'to-delete.txt',
                encoding: '7bit',
                mimetype: 'text/plain',
                size: 256,
                destination: '',
                filename: 'to-delete.txt',
                path: '',
                buffer: Buffer.from('content to delete'),
                stream: null,
            };

            fileToDelete = await fileService.uploadFile(mockFile);
        });

        it('should delete file and its metadata', async () => {
            await fileService.deleteFile(fileToDelete.fileId);

            // Verify file is deleted from storage
            expect(mockStorage.getStoredFile(fileToDelete.filePath)).toBeUndefined();

            // Verify metadata is deleted
            const found = await fileService.findFileById(fileToDelete.fileId);
            expect(found).toBeNull();
        });

        it('should throw NotFoundException for non-existent file id', async () => {
            await expect(fileService.deleteFile(NON_EXISTENT_UUID)).rejects.toThrow(NotFoundException);
        });
    });
});
