import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 프로젝트 목록 조회 응답 DTO
 */
export class ProjectListItemDto {
    @ApiProperty({ description: '프로젝트 ID' })
    id: string;

    @ApiProperty({ description: '프로젝트 코드' })
    projectCode: string;

    @ApiProperty({ description: '프로젝트명' })
    projectName: string;

    @ApiPropertyOptional({ description: '프로젝트 설명' })
    description?: string | null;

    @ApiProperty({ description: '활성화 여부' })
    isActive: boolean;
}

/**
 * 프로젝트 목록 조회 응답 DTO
 */
export class GetProjectListResponseDto {
    @ApiProperty({ description: '프로젝트 목록', type: [ProjectListItemDto] })
    projects: ProjectListItemDto[];

    @ApiProperty({ description: '전체 프로젝트 수' })
    totalCount: number;
}
