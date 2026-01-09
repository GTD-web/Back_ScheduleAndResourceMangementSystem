import { ApiProperty } from '@nestjs/swagger';

export class ProjectLevelDto {
    @ApiProperty({
        description: '?„ë¡œ?íŠ¸ ?ˆë²¨ ?œëª©',
        example: '?ìœ„ ?„ë¡œ?íŠ¸',
    })
    title: string;
}
