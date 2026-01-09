import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentResponseDto {
    @ApiProperty({ description: '부서 ID' })
    id: string;

    @ApiProperty({ description: '부서명' })
    departmentName: string;

    @ApiProperty({ description: '부서 코드' })
    departmentCode: string;

    @ApiProperty({ description: '부서 유형' })
    type: string;

    @ApiPropertyOptional({ description: '상위 부서 ID' })
    parentDepartmentId?: string;

    @ApiProperty({ description: '정렬 순서' })
    order: number;

    @ApiProperty({ description: '생성일' })
    createdAt: Date;

    @ApiProperty({ description: '수정일' })
    updatedAt: Date;
}

export class DepartmentHierarchyDto {
    @ApiProperty({ description: '부서 ID' })
    id: string;

    @ApiProperty({ description: '부서명' })
    departmentName: string;

    @ApiProperty({ description: '부서 코드' })
    departmentCode: string;

    @ApiProperty({ description: '부서 유형' })
    type: string;

    @ApiPropertyOptional({ description: '상위 부서 ID' })
    parentDepartmentId?: string;

    @ApiProperty({ description: '정렬 순서' })
    order: number;

    @ApiProperty({ description: '생성일' })
    createdAt: Date;

    @ApiProperty({ description: '수정일' })
    updatedAt: Date;

    @ApiProperty({
        description: '하위 부서 목록',
        type: [DepartmentHierarchyDto],
    })
    childDepartments: DepartmentHierarchyDto[];

    @ApiProperty({ description: '하위 부서 수' })
    childDepartmentCount: number;
}

export class DepartmentListResponseDto {
    @ApiProperty({
        description: '부서 목록',
        type: [DepartmentResponseDto],
    })
    departments: DepartmentResponseDto[];

    @ApiProperty({ description: '총 부서 수' })
    totalCount: number;
}

export class DepartmentHierarchyResponseDto {
    @ApiProperty({
        description: '부서 계층구조',
        type: [DepartmentHierarchyDto],
    })
    departments: DepartmentHierarchyDto[];

    @ApiProperty({ description: '총 부서 수' })
    totalCount: number;

    @ApiProperty({ description: '루트 부서 수' })
    rootCount: number;

    @ApiProperty({ description: '최대 깊이' })
    maxDepth: number;
}
