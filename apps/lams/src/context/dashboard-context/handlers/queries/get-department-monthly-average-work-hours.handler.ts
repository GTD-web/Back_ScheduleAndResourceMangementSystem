import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetDepartmentMonthlyAverageWorkHoursQuery } from './get-department-monthly-average-work-hours.query';
import { IGetDepartmentMonthlyAverageWorkHoursResponse } from '../../interfaces';
import { DomainDataSnapshotChildService } from '../../../../domain/data-snapshot-child/data-snapshot-child.service';
import { ApprovalStatus } from '../../../../domain/data-snapshot-info/data-snapshot-info.types';
import { DomainEmployeeDepartmentPositionHistoryService } from '@libs/modules/employee-department-position-history/employee-department-position-history.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DataSnapshotChild } from '../../../../domain/data-snapshot-child/data-snapshot-child.entity';
import { startOfMonth, endOfMonth, format } from 'date-fns';

/**
 * 부서별 월별 일평균 근무시간 조회 Query Handler
 *
 * 연도별로 1월부터 12월까지의 평균근무시간 목록과
 * 월별 직원별 총 근무시간을 내림차순으로 조회합니다.
 * 지각, 조퇴 정보를 포함합니다.
 *
 * 하위 스냅샷 데이터를 기반으로 조회합니다.
 * 부서별로 해당 연도와 월별로 각 월별 구성원 정보를 가져온 후,
 * 직원 정보를 통해 하위 스냅샷 데이터를 조회합니다.
 * 동일 연월에 여러 개의 스냅샷이 있다면 결재 상태가 "제출됨"이면서 제출 시간이 가장 최신인 스냅샷을 사용합니다.
 */
@QueryHandler(GetDepartmentMonthlyAverageWorkHoursQuery)
export class GetDepartmentMonthlyAverageWorkHoursHandler
    implements IQueryHandler<GetDepartmentMonthlyAverageWorkHoursQuery, IGetDepartmentMonthlyAverageWorkHoursResponse>
{
    private readonly logger = new Logger(GetDepartmentMonthlyAverageWorkHoursHandler.name);

    constructor(
        private readonly dataSnapshotChildService: DomainDataSnapshotChildService,
        private readonly employeeDepartmentPositionHistoryService: DomainEmployeeDepartmentPositionHistoryService,
        @InjectRepository(DataSnapshotChild)
        private readonly dataSnapshotChildRepository: Repository<DataSnapshotChild>,
    ) {}

    async execute(query: GetDepartmentMonthlyAverageWorkHoursQuery): Promise<IGetDepartmentMonthlyAverageWorkHoursResponse> {
        const { departmentId, year } = query.data;

        this.logger.log(`부서별 월별 일평균 근무시간 조회: departmentId=${departmentId}, year=${year}`);

        // 1. 연도 전체 월별 데이터 집계
        const monthlyAverages: Array<{
            month: string;
            averageWorkHours: number;
            employeeWorkHours: Array<{
                employeeId: string;
                employeeName: string;
                employeeNumber: string;
                totalWorkHours: number;
                lateCount: number;
                earlyLeaveCount: number;
                weeklyWorkHours: Array<{
                    weekNumber: number;
                    startDate: string;
                    endDate: string;
                    weeklyWorkHours: number;
                }>;
            }>;
        }> = [];

        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, '0');
            const mm = monthStr;

            // 1-1. 해당 월의 부서별 직원 목록 조회 (해당 월의 범위: 첫 날짜 ~ 마지막 날짜)
            const employeeHistories = await this.employeeDepartmentPositionHistoryService.특정연월부서의배치이력목록을조회한다(
                year,
                monthStr,
                departmentId,
            );
            const employeeIds = employeeHistories.map((eh) => eh.employeeId).filter((id) => id);

            if (employeeIds.length === 0) {
                monthlyAverages.push({
                    month: monthStr,
                    averageWorkHours: 0,
                    employeeWorkHours: [],
                });
                continue;
            }

            // 1-2. 각 직원별로 하위 스냅샷 조회 (연도, 월, 직원ID로)
            const allChildren = await this.dataSnapshotChildRepository
                .createQueryBuilder('child')
                .leftJoinAndSelect('child.parentSnapshot', 'parent')
                .where('child.yyyy = :yyyy', { yyyy: year })
                .andWhere('child.mm = :mm', { mm })
                .andWhere('child.employee_id IN (:...employeeIds)', { employeeIds })
                .andWhere('child.deleted_at IS NULL')
                .getMany();

            if (allChildren.length === 0) {
                monthlyAverages.push({
                    month: monthStr,
                    averageWorkHours: 0,
                    employeeWorkHours: [],
                });
                continue;
            }

            // 1-3. 직원별로 여러 스냅샷이 있을 경우, 결재 상태가 "제출됨"이고 제출 시간이 가장 최신인 스냅샷의 child 선택
            const selectedChildrenMap = new Map<string, DataSnapshotChild>();

            // 직원별로 그룹화
            const childrenByEmployee = new Map<string, DataSnapshotChild[]>();
            allChildren.forEach((child) => {
                const employeeId = child.employee_id;
                if (!childrenByEmployee.has(employeeId)) {
                    childrenByEmployee.set(employeeId, []);
                }
                childrenByEmployee.get(employeeId)!.push(child);
            });

            // 각 직원별로 최적의 child 선택
            childrenByEmployee.forEach((children, employeeId) => {
                if (children.length === 1) {
                    selectedChildrenMap.set(employeeId, children[0]);
                } else {
                    // 결재 상태가 "제출됨"이고 제출 시간이 가장 최신인 스냅샷의 child 선택
                    const submittedChildren = children.filter(
                        (c) => c.parentSnapshot?.approval_status === ApprovalStatus.SUBMITTED && c.parentSnapshot?.submitted_at !== null,
                    );

                    let selectedChild: DataSnapshotChild | null = null;
                    if (submittedChildren.length > 0) {
                        // 제출 시간 기준으로 내림차순 정렬하여 가장 최신 것 선택
                        selectedChild = submittedChildren.sort((a, b) => {
                            const dateA = a.parentSnapshot?.submitted_at ? new Date(a.parentSnapshot.submitted_at).getTime() : 0;
                            const dateB = b.parentSnapshot?.submitted_at ? new Date(b.parentSnapshot.submitted_at).getTime() : 0;
                            return dateB - dateA;
                        })[0];
                    } else {
                        // 제출된 스냅샷이 없으면 가장 최신 스냅샷 선택
                        selectedChild = children.sort((a, b) => {
                            const dateA = a.parentSnapshot?.created_at ? new Date(a.parentSnapshot.created_at).getTime() : 0;
                            const dateB = b.parentSnapshot?.created_at ? new Date(b.parentSnapshot.created_at).getTime() : 0;
                            return dateB - dateA;
                        })[0];
                    }

                    if (selectedChild) {
                        selectedChildrenMap.set(employeeId, selectedChild);
                    }
                }
            });

            // 1-4. 선택된 child들의 데이터 집계
            let totalWorkTime = 0;
            let totalWorkDays = 0;
            const monthEmployeeWorkHoursMap = new Map<string, {
                employeeId: string;
                employeeName: string;
                employeeNumber: string;
                totalWorkHours: number;
                lateCount: number;
                earlyLeaveCount: number;
                weeklyWorkHours: Array<{
                    weekNumber: number;
                    startDate: string;
                    endDate: string;
                    weeklyWorkHours: number;
                }>;
            }>();

            selectedChildrenMap.forEach((child) => {
                try {
                    const snapshotData = typeof child.snapshot_data === 'string' 
                        ? JSON.parse(child.snapshot_data) 
                        : child.snapshot_data;

                    // 월간 요약 데이터 추출
                    const workDaysCount = snapshotData.workDaysCount || 0;
                    const totalWorkTimeValue = snapshotData.totalWorkTime || 0; // 분 단위
                    const attendanceTypeCount = snapshotData.attendanceTypeCount || {};
                    const weeklyWorkTimeSummary = snapshotData.weeklyWorkTimeSummary || [];

                    totalWorkTime += totalWorkTimeValue;
                    totalWorkDays += workDaysCount;

                    // 직원별 근무시간 집계 (지각, 조퇴 포함) - 월별로 저장
                    const employeeId = child.employee_id;
                    if (!monthEmployeeWorkHoursMap.has(employeeId)) {
                        monthEmployeeWorkHoursMap.set(employeeId, {
                            employeeId,
                            employeeName: child.employee_name || '',
                            employeeNumber: child.employee_number || '',
                            totalWorkHours: 0,
                            lateCount: 0,
                            earlyLeaveCount: 0,
                            weeklyWorkHours: [],
                        });
                    }

                    const workHours = monthEmployeeWorkHoursMap.get(employeeId)!;
                    workHours.totalWorkHours += totalWorkTimeValue; // 분 단위로 누적

                    // 지각, 조퇴 카운트
                    workHours.lateCount += attendanceTypeCount['지각'] || 0;
                    workHours.earlyLeaveCount += attendanceTypeCount['조퇴'] || 0;

                    // 주차별 근무시간 정보 추가
                    weeklyWorkTimeSummary.forEach((week: any) => {
                        workHours.weeklyWorkHours.push({
                            weekNumber: week.weekNumber || 0,
                            startDate: week.startDate || '',
                            endDate: week.endDate || '',
                            weeklyWorkHours: Math.round(((week.weeklyWorkTime || 0) / 60) * 100) / 100, // 분을 시간으로 변환
                        });
                    });
                } catch (error) {
                    this.logger.warn(`스냅샷 데이터 파싱 실패: childId=${child.id}, error=${error.message}`);
                }
            });

            // 일평균 근무시간 계산
            const averageWorkHours = totalWorkDays > 0 ? totalWorkTime / totalWorkDays / 60 : 0; // 분을 시간으로 변환

            // 월별 직원 근무시간을 시간 단위로 변환하고 내림차순 정렬
            const monthEmployeeWorkHours = Array.from(monthEmployeeWorkHoursMap.values())
                .map((e) => ({
                    ...e,
                    totalWorkHours: Math.round((e.totalWorkHours / 60) * 100) / 100, // 분을 시간으로 변환
                    weeklyWorkHours: e.weeklyWorkHours.sort((a, b) => a.weekNumber - b.weekNumber), // 주차 번호로 정렬
                }))
                .sort((a, b) => b.totalWorkHours - a.totalWorkHours);

            monthlyAverages.push({
                month: monthStr,
                averageWorkHours: Math.round(averageWorkHours * 100) / 100, // 소수점 둘째자리까지
                employeeWorkHours: monthEmployeeWorkHours,
            });
        }

        return {
            departmentId,
            year,
            monthlyAverages,
        };
    }
}
