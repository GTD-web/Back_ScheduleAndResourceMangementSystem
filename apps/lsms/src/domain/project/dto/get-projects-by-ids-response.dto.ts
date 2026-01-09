import { ApiProperty } from '@nestjs/swagger';
import { ProjectDataDto } from './project-data.dto';

export class GetProjectsByIdsResponseDto {
    @ApiProperty({
        description: '찾�? ?�로?�트 목록',
        type: [ProjectDataDto],
    })
    projects: ProjectDataDto[];

    @ApiProperty({
        description: '찾�? 못한 ?�로?�트 ID 목록',
        example: ['non-existent-id-1', 'non-existent-id-2'],
        type: [String],
    })
    notFound: string[];
}
