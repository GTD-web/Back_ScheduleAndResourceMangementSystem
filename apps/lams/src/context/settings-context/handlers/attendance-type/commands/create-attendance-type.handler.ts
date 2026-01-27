import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateAttendanceTypeCommand } from './create-attendance-type.command';
import { ICreateAttendanceTypeResponse } from '../../../interfaces/response/create-attendance-type-response.interface';
import { AttendanceType } from '../../../../../domain/attendance-type/attendance-type.entity';

/**
 * 근태유형 생성 Handler
 */
@CommandHandler(CreateAttendanceTypeCommand)
export class CreateAttendanceTypeHandler
    implements ICommandHandler<CreateAttendanceTypeCommand, ICreateAttendanceTypeResponse>
{
    private readonly logger = new Logger(CreateAttendanceTypeHandler.name);

    constructor(private readonly dataSource: DataSource) {}

    async execute(command: CreateAttendanceTypeCommand): Promise<ICreateAttendanceTypeResponse> {
        const { title, workTime, isRecognizedWorkTime, startWorkTime, endWorkTime, deductedAnnualLeave, code, isActive, performedBy } =
            command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`근태유형 생성 시작: title=${title}`);

                const attendanceTypeEntity = new AttendanceType(
                    title,
                    workTime,
                    isRecognizedWorkTime,
                    startWorkTime,
                    endWorkTime,
                    deductedAnnualLeave,
                    code,
                    isActive,
                );
                attendanceTypeEntity.생성자설정한다(performedBy);
                attendanceTypeEntity.메타데이터업데이트한다(performedBy);
                const saved = await manager.save(attendanceTypeEntity);
                const attendanceType = saved.DTO변환한다();

                this.logger.log(`근태유형 생성 완료: attendanceTypeId=${attendanceType.id}`);

                return {
                    attendanceType,
                };
            } catch (error) {
                this.logger.error(`근태유형 생성 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
