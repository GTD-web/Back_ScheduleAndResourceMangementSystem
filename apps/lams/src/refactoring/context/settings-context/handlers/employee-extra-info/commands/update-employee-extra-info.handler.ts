import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateEmployeeExtraInfoCommand } from './update-employee-extra-info.command';
import { IUpdateEmployeeExtraInfoResponse } from '../../../interfaces/response/update-employee-extra-info-response.interface';
import { DomainEmployeeExtraInfoService } from '../../../../../domain/employee-extra-info/employee-extra-info.service';

/**
 * 직원 추가 정보 변경 Handler
 *
 * 직원의 대시보드 요약 표시 여부를 변경합니다.
 */
@CommandHandler(UpdateEmployeeExtraInfoCommand)
export class UpdateEmployeeExtraInfoHandler
    implements ICommandHandler<UpdateEmployeeExtraInfoCommand, IUpdateEmployeeExtraInfoResponse>
{
    private readonly logger = new Logger(UpdateEmployeeExtraInfoHandler.name);

    constructor(
        private readonly employeeExtraInfoService: DomainEmployeeExtraInfoService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: UpdateEmployeeExtraInfoCommand): Promise<IUpdateEmployeeExtraInfoResponse> {
        const { employeeId, isExcludedFromSummary, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(
                    `직원 추가 정보 변경 시작: employeeId=${employeeId}, isExcludedFromSummary=${isExcludedFromSummary}`,
                );

                // 직원 ID로 생성 또는 수정
                const extraInfo = await this.employeeExtraInfoService.직원ID로생성또는수정한다(
                    employeeId,
                    {
                        isExcludedFromSummary,
                    },
                    performedBy,
                    manager,
                );

                this.logger.log(`직원 추가 정보 변경 완료: extraInfoId=${extraInfo.id}`);

                return {
                    extraInfo,
                };
            } catch (error) {
                this.logger.error(`직원 추가 정보 변경 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
