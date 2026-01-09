import { ApiProperty } from '@nestjs/swagger';
import { ProjectManagerDto } from './project-manager.dto';
import { ProjectLevelDto } from './project-level.dto';

export class ProjectDataDto {
    @ApiProperty({
        description: '?„ë¡œ?íŠ¸ ê³ ìœ  ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: '?„ë¡œ?íŠ¸ ?´ë¦„',
        example: 'ë£¨ë?ë¥??µí•© ?¬íƒˆ ê°œë°œ',
    })
    projectName: string;

    @ApiProperty({
        description: '?„ë¡œ?íŠ¸ ì½”ë“œ',
        example: 'LUMIR-2024-001',
        nullable: true,
    })
    projectCode: string | null;

    @ApiProperty({
        description: '?„ë¡œ?íŠ¸ ë§¤ë‹ˆ?€ ?•ë³´',
        type: ProjectManagerDto,
    })
    projectManager: ProjectManagerDto;

    @ApiProperty({
        description: '?„ë¡œ?íŠ¸ ?ˆë²¨ ?•ë³´',
        type: ProjectLevelDto,
    })
    projectLevel: ProjectLevelDto;

    @ApiProperty({
        description: '?ìœ„ ?„ë¡œ?íŠ¸ ID',
        example: '456e7890-e89b-12d3-a456-426614174001',
        nullable: true,
    })
    parentProjectId: string | null;
}
