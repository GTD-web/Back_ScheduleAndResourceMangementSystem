import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class SystemVariableInfoEntity {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        description: '시스템 변수 아이디',
        example: 'exSystemVariableId',
    })
    systemVariableId: string;

    @Column()
    @ApiProperty({
        description: '시스템 변수 이름',
        example: 'exSystemVariableName',
    })
    systemVariableName: string;

    @Column()
    @ApiProperty({
        description: '시스템 변수 값',
        example: 'exSystemVariableValue',
    })
    systemVariableValue: string;
}
