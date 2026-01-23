import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetAttendanceTypeListQuery } from './get-attendance-type-list.query';
import { IGetAttendanceTypeListResponse } from '../../../interfaces/response/get-attendance-type-list-response.interface';
import { DomainAttendanceTypeService } from '../../../../../domain/attendance-type/attendance-type.service';

/**
 * 근태유형 목록 조회 Query Handler
 */
@QueryHandler(GetAttendanceTypeListQuery)
export class GetAttendanceTypeListHandler
    implements IQueryHandler<GetAttendanceTypeListQuery, IGetAttendanceTypeListResponse>
{
    private readonly logger = new Logger(GetAttendanceTypeListHandler.name);

    constructor(private readonly attendanceTypeService: DomainAttendanceTypeService) {}

    async execute(query: GetAttendanceTypeListQuery): Promise<IGetAttendanceTypeListResponse> {
        this.logger.log('근태유형 목록 조회 시작');

        const attendanceTypes = await this.attendanceTypeService.목록조회한다();

        this.logger.log(`근태유형 목록 조회 완료: totalCount=${attendanceTypes.length}`);

        return {
            attendanceTypes,
            totalCount: attendanceTypes.length,
        };
    }
}
