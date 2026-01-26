import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeleteAttendanceTypeCommand } from './delete-attendance-type.command';
import { IDeleteAttendanceTypeResponse } from '../../../interfaces/response/delete-attendance-type-response.interface';
import { DomainAttendanceTypeService } from '../../../../../domain/attendance-type/attendance-type.service';

/**
 * 근태유형 삭제 Handler
 */
@CommandHandler(DeleteAttendanceTypeCommand)
export class DeleteAttendanceTypeHandler
    implements ICommandHandler<DeleteAttendanceTypeCommand, IDeleteAttendanceTypeResponse>
{
    private readonly logger = new Logger(DeleteAttendanceTypeHandler.name);

    constructor(
        private readonly attendanceTypeService: DomainAttendanceTypeService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: DeleteAttendanceTypeCommand): Promise<IDeleteAttendanceTypeResponse> {
        const { id, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`근태유형 삭제 시작: id=${id}`);

                await this.attendanceTypeService.삭제한다(id, performedBy, manager);

                this.logger.log(`근태유형 삭제 완료: id=${id}`);

                return {
                    success: true,
                };
            } catch (error) {
                this.logger.error(`근태유형 삭제 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
