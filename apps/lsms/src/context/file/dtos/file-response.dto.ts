import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    fileId: string;

    @ApiProperty({ example: 'image.jpg' })
    fileName: string;

    @ApiProperty({ example: 'uploads/20250226123456-image.jpg' })
    filePath: string;
}
