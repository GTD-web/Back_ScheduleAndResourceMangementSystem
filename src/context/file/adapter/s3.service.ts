import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { File } from '../../../../libs/entities/file.entity';
import { DateUtil } from '../../../../libs/utils/date.util';
import { MimeType } from '../../../../libs/enums/mime-type.enum';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        this.bucketName = this.configService.get<string>('S3_BUCKET_NAME');

        this.s3Client = new S3Client({
            region: this.configService.get<string>('S3_REGION'),
            endpoint: this.configService.get<string>('S3_ENDPOINT'),
            credentials: {
                accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
                secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
            },
            forcePathStyle: true,
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<File> {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${DateUtil.now().format('YYYYMMDDHHmmssSSS')}.${fileExtension}`;

        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: fileName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }),
            );

            const newFile = {
                fileName: fileName,
                filePath: this.getFileUrl(fileName),
            } as File;

            return newFile;
        } catch (error) {
            throw new Error(`Failed to upload file to S3: ${error.message}`);
        }
    }

    async deleteFile(file: File): Promise<void> {
        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: file.fileName,
                }),
            );
        } catch (error) {
            throw new Error(`Failed to delete file from S3: ${error.message}`);
        }
    }
    getFileUrl(fileKey: string): string {
        return `${this.configService.get<string>('S3_ENDPOINT').replace('s3', 'object/public')}/${this.bucketName}/${fileKey}`;
    }

    async generatePresignedUrl(mime: MimeType): Promise<string> {
        const extMap = {
            [MimeType.IMAGE_JPEG]: 'jpg',
            [MimeType.IMAGE_PNG]: 'png',
            [MimeType.IMAGE_WEBP]: 'webp',
        };

        const fileExtension = extMap[mime] || 'bin';
        const fileKey = `${DateUtil.now().format('YYYYMMDDHHmmssSSS')}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
            ContentType: mime,
        });
        const url = await getSignedUrl(this.s3Client, command, { expiresIn: 60 * 2 });
        return url;
    }

    async checkFileExists(fileKey: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });
            const result = await this.s3Client.send(command);
            return result.ContentLength !== undefined && result.ContentLength > 0;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
