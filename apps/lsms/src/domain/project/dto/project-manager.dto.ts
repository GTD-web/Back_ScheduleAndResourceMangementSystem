import { ApiProperty } from '@nestjs/swagger';

export class ProjectManagerDto {
    @ApiProperty({
        description: '?�로?�트 매니?� ?�름',
        example: '김철수',
        nullable: true,
    })
    name: string | null;
}
