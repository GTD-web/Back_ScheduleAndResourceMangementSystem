import { ApiProperty } from '@nestjs/swagger';
import { ProjectDataDto } from './project-data.dto';
import { HierarchicalProjectDataDto } from './hierarchical-project-data.dto';

export class ProjectHierarchyResponseDto {
    @ApiProperty({
        description: '프로젝트 계층구조 (flatten=true: 1차원 배열, flatten=false: 계층구조)',
        type: [Object], // 동적 타입이므로 Object로 설정
    })
    projectHierarchy: ProjectDataDto[] | HierarchicalProjectDataDto[];
}
