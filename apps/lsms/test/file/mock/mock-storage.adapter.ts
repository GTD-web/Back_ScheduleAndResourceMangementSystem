import { FileStoragePort } from '@resource/modules/file/domain/ports/file-storage.port';
import { File } from '../../../../libs/entities';
import { v4 as uuidv4 } from 'uuid';

export class MockStorageAdapter implements FileStoragePort {
    private storage = new Map<string, Buffer>();

    async uploadFile(file: Express.Multer.File): Promise<File> {
        const fileId = uuidv4();
        const filePath = `test-files/${fileId}/${file.originalname}`;

        this.storage.set(filePath, file.buffer);

        const newFile = new File();
        newFile.fileId = fileId;
        newFile.fileName = file.originalname;
        newFile.filePath = filePath;

        return newFile;
    }

    async deleteFile(file: File): Promise<void> {
        this.storage.delete(file.filePath);
    }

    // Helper method for testing
    getStoredFile(filePath: string): Buffer | undefined {
        return this.storage.get(filePath);
    }
}
