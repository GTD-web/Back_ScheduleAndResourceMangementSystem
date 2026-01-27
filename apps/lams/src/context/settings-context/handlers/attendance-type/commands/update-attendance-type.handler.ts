import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateAttendanceTypeCommand } from './update-attendance-type.command';
import { IUpdateAttendanceTypeResponse } from '../../../interfaces/response/update-attendance-type-response.interface';
import { DomainAttendanceTypeService } from '../../../../../domain/attendance-type/attendance-type.service';

/**
 * 근태유형 수정 Handler
 */
@CommandHandler(UpdateAttendanceTypeCommand)
export class UpdateAttendanceTypeHandler
    implements ICommandHandler<UpdateAttendanceTypeCommand, IUpdateAttendanceTypeResponse>
{
    private readonly logger = new Logger(UpdateAttendanceTypeHandler.name);

    constructor(
        private readonly attendanceTypeService: DomainAttendanceTypeService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: UpdateAttendanceTypeCommand): Promise<IUpdateAttendanceTypeResponse> {
        const { id, title, workTime, isRecognizedWorkTime, startWorkTime, endWorkTime, deductedAnnualLeave, code, isActive, performedBy } =
            command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`근태유형 수정 시작: id=${id}`);

                const attendanceType = await this.attendanceTypeService.수정한다(
                    id,
                    {
                        title,
                        workTime,
                        isRecognizedWorkTime,
                        startWorkTime,
                        endWorkTime,
                        deductedAnnualLeave,
                        code,
                        isActive,
                    },
                    performedBy,
                    manager,
                );

                this.logger.log(`근태유형 수정 완료: attendanceTypeId=${attendanceType.id}`);

                return {
                    attendanceType,
                };
            } catch (error) {
                this.logger.error(`근태유형 수정 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
