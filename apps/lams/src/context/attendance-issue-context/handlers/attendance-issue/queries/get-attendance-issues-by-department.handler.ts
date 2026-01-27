import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetAttendanceIssuesByDepartmentQuery } from './get-attendance-issues-by-department.query';
import { IGetAttendanceIssuesByDepartmentResponse } from '../../../interfaces/response/get-attendance-issues-by-department-response.interface';
import { DomainAttendanceIssueService } from '../../../../../domain/attendance-issue/attendance-issue.service';
import { DomainEmployeeDepartmentPositionHistoryService } from '@libs/modules/employee-department-position-history/employee-department-position-history.service';
import { startOfMonth, endOfMonth, format } from 'date-fns';

/**
 * 연월/부서별 근태 이슈 조회 Query Handler
 *
 * 해당 연월과 부서에 소속되었던 직원들의 근태 이슈를 조회하고 직원별로 그룹핑합니다.
 */
@QueryHandler(GetAttendanceIssuesByDepartmentQuery)
export class GetAttendanceIssuesByDepartmentHandler
    implements IQueryHandler<GetAttendanceIssuesByDepartmentQuery, IGetAttendanceIssuesByDepartmentResponse>
{
    private readonly logger = new Logger(GetAttendanceIssuesByDepartmentHandler.name);

    constructor(
        private readonly attendanceIssueService: DomainAttendanceIssueService,
        private readonly employeeDepartmentPositionHistoryService: DomainEmployeeDepartmentPositionHistoryService,
    ) {}

    async execute(
        query: GetAttendanceIssuesByDepartmentQuery,
    ): Promise<IGetAttendanceIssuesByDepartmentResponse> {
        const { year, month, departmentId } = query.data;

        this.logger.log(`연월/부서별 근태 이슈 조회 시작: year=${year}, month=${month}, departmentId=${departmentId}`);

        // 1. 해당 연월의 날짜 범위 계산 (첫날부터 말일까지)
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const monthStart = startOfMonth(new Date(yearNum, monthNum - 1, 1));
        const monthEnd = endOfMonth(new Date(yearNum, monthNum - 1, 1));
        const startDate = format(monthStart, 'yyyy-MM-dd');
        const endDate = format(monthEnd, 'yyyy-MM-dd');

        this.logger.log(`날짜 범위: ${startDate} ~ ${endDate}`);

        // 2. 해당 부서의 해당 연월에 소속되었던 직원 리스트 조회
        const departmentEmployees = await this.employeeDepartmentPositionHistoryService.특정연월부서의배치이력목록을조회한다(
            year,
            month,
            departmentId,
        );

        if (departmentEmployees.length === 0) {
            this.logger.log(`해당 부서에 소속된 직원이 없습니다: departmentId=${departmentId}`);
            return {
                employeeIssueGroups: [],
                totalIssues: 0,
                totalEmployees: 0,
            };
        }

        // 3. 직원 ID 목록 추출
        const employeeIds = departmentEmployees.map((history) => history.employeeId);
        this.logger.log(`부서별 직원 조회 완료: employeeCount=${employeeIds.length}`);

        // 4. 해당 날짜 범위의 모든 이슈 조회
        const allIssues = await this.attendanceIssueService.날짜범위로조회한다(startDate, endDate);

        // 5. 해당 직원들의 이슈만 필터링
        const departmentIssues = allIssues.filter((issue) => employeeIds.includes(issue.employeeId));

        this.logger.log(`이슈 조회 완료: totalIssues=${allIssues.length}, departmentIssues=${departmentIssues.length}`);

        // 6. 직원별로 그룹핑
        const employeeIssueMap = new Map<string, typeof departmentIssues>();
        const employeeInfoMap = new Map<
            string,
            { employeeName: string; employeeNumber: string }
        >();

        // 직원 정보 맵 생성
        departmentEmployees.forEach((history) => {
            employeeInfoMap.set(history.employeeId, {
                employeeName: history.employee?.name || '이름 없음',
                employeeNumber: history.employee?.employeeNumber || '',
            });
        });

        // 이슈를 직원별로 그룹핑
        departmentIssues.forEach((issue) => {
            if (!employeeIssueMap.has(issue.employeeId)) {
                employeeIssueMap.set(issue.employeeId, []);
            }
            employeeIssueMap.get(issue.employeeId)!.push(issue);
        });

        // 7. 응답 형식으로 변환
        const employeeIssueGroups = Array.from(employeeIssueMap.entries()).map(([employeeId, issues]) => {
            const employeeInfo = employeeInfoMap.get(employeeId) || {
                employeeName: '이름 없음',
                employeeNumber: '',
            };

            return {
                employeeId,
                employeeName: employeeInfo.employeeName,
                employeeNumber: employeeInfo.employeeNumber,
                issues: issues.sort((a, b) => {
                    // 날짜 내림차순, 생성일시 내림차순 정렬
                    const dateCompare = b.date.localeCompare(a.date);
                    if (dateCompare !== 0) return dateCompare;
                    return b.createdAt.getTime() - a.createdAt.getTime();
                }),
            };
        });

        // 직원 ID 순서대로 정렬 (부서 직원 목록 순서 유지)
        employeeIssueGroups.sort((a, b) => {
            const indexA = employeeIds.indexOf(a.employeeId);
            const indexB = employeeIds.indexOf(b.employeeId);
            return indexA - indexB;
        });

        this.logger.log(
            `연월/부서별 근태 이슈 조회 완료: totalEmployees=${employeeIssueGroups.length}, totalIssues=${departmentIssues.length}`,
        );

        return {
            employeeIssueGroups,
            totalIssues: departmentIssues.length,
            totalEmployees: employeeIssueGroups.length,
        };
    }
}
