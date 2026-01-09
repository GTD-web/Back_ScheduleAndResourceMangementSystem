import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDataDto {
    @ApiProperty({ description: '파일 경로' })
    filePath: string;
}
