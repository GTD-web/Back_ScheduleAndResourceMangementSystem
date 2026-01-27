import { ApiProperty } from '@nestjs/swagger';

/**
 * 부서 정보 응답 DTO
 */
export class DepartmentInfoForPermissionResponseDto {
    @ApiProperty({ description: '부서 ID' })
    id: string;

    @ApiProperty({ description: '부서 코드' })
    departmentCode: string;

    @ApiProperty({ description: '부서명' })
    departmentName: string;

    @ApiProperty({ description: '부서 타입' })
    type: string;

    @ApiProperty({ description: '정렬 순서' })
    order: number;
}

/**
 * 권한 관리용 부서 목록 조회 응답 DTO
 */
export class GetDepartmentListForPermissionResponseDto {
    @ApiProperty({ description: '부서 목록', type: [DepartmentInfoForPermissionResponseDto] })
    departments: DepartmentInfoForPermissionResponseDto[];

    @ApiProperty({ description: '전체 부서 수' })
    totalCount: number;
}
