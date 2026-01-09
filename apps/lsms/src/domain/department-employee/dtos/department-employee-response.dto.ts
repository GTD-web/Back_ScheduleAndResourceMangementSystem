import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentEmployeeResponseDto {
    @ApiProperty({ description: '부서-직원 관계 ID' })
    id: string;

    @ApiProperty({ description: '부서 ID' })
    departmentId: string;

    @ApiProperty({ description: '직원 ID' })
    employeeId: string;

    @ApiProperty({ description: '부서장 여부' })
    isManager: boolean;

    @ApiProperty({ description: '소속 시작일' })
    startDate: Date;

    @ApiPropertyOptional({ description: '소속 종료일' })
    endDate?: Date;

    @ApiProperty({ description: '활성 상태' })
    isActive: boolean;

    @ApiProperty({ description: '생성일' })
    createdAt: Date;

    @ApiProperty({ description: '수정일' })
    updatedAt: Date;

    // 조인된 정보
    @ApiPropertyOptional({ description: '부서 정보' })
    department?: {
        id: string;
        departmentName: string;
        departmentCode: string;
        type: string;
    };

    @ApiPropertyOptional({ description: '직원 정보' })
    employee?: {
        id: string;
        name: string;
        employeeNumber: string;
        email: string;
    };
}

export class DepartmentEmployeesResponseDto {
    @ApiProperty({ description: '부서 정보' })
    department: {
        id: string;
        departmentName: string;
        departmentCode: string;
        type: string;
    };

    @ApiProperty({
        description: '부서 소속 직원 목록',
        type: [DepartmentEmployeeResponseDto],
    })
    employees: DepartmentEmployeeResponseDto[];

    @ApiProperty({ description: '총 직원 수' })
    totalEmployees: number;

    @ApiProperty({ description: '부서장 수' })
    managerCount: number;
}
