import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FileManagementContext } from '../file-management';
import { DomainEmployeeService } from '../../domain/employee/employee.service';
import { DomainEmployeeRepository } from '../../domain/employee/employee.repository';
import { DomainAttendanceTypeService } from '../../domain/attendance-type/attendance-type.service';
import { DomainHolidayInfoService } from '../../domain/holiday-info/holiday-info.service';
import { DomainUsedAttendanceService } from '../../domain/used-attendance/used-attendance.service';
import { DomainEventInfoService } from '../../domain/event-info/event-info.service';
import { DomainDailyEventSummaryService } from '../../domain/daily-event-summary/daily-event-summary.service';
import {
    ExtractEmployeeInfoType,
    ExtractEventInfoType,
    AttendanceRecordType,
    ExtractUsedAttendanceDataType,
} from '../../../common/types/excel.type';
import { EventInfo } from '../../domain/event-info/event-info.entity';
import { UsedAttendance } from '../../domain/used-attendance/used-attendance.entity';
import { DailyEventSummary } from '../../domain/daily-event-summary/daily-event-summary.entity';
import { format, parse } from 'date-fns';
import { In, DataSource } from 'typeorm';

/**
 * 출입/근태 데이터 가공 Context
 *
 * 엑셀 파일에서 읽은 데이터를 가공하여 DB에 저장하는 비즈니스 로직을 담당합니다.
 */
@Injectable()
export class AttendanceDataContext {
    private readonly logger = new Logger(AttendanceDataContext.name);

    constructor(
        private readonly fileManagementContext: FileManagementContext,
        private readonly employeeRepository: DomainEmployeeRepository,
        private readonly attendanceTypeService: DomainAttendanceTypeService,
        private readonly holidayInfoService: DomainHolidayInfoService,
        private readonly usedAttendanceService: DomainUsedAttendanceService,
        private readonly eventInfoService: DomainEventInfoService,
        private readonly dailyEventSummaryService: DomainDailyEventSummaryService,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * 출입 이벤트 엑셀 파일 업로드 및 처리
     *
     * @param file 업로드된 파일
     * @param uploadBy 업로더 ID
     * @param generateSummary 일일 요약 생성 여부 (기본값: false)
     * @param externalQueryRunner 외부 트랜잭션 (선택)
     * @returns 처리 결과
     */
    async uploadAndProcessEventHistory(file: Express.Multer.File, uploadBy: string, externalQueryRunner?: any) {
        const totalStartTime = Date.now();
        const queryRunner = externalQueryRunner || this.dataSource.createQueryRunner();
        const isExternalTransaction = !!externalQueryRunner;

        if (!isExternalTransaction) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        try {
            this.logger.log(`출입 이벤트 파일 업로드 시작: ${file.originalname}`);

            // 1. 파일 업로드
            const uploadResult = await this.fileManagementContext.uploadFile(file, uploadBy, {
                folder: 'event-history',
            });

            this.logger.log(`파일 업로드 완료: ${uploadResult.fileEntity.fileId}`);

            // 2. 엑셀 데이터 읽기
            const excelData = await this.fileManagementContext.readExcelAsJson(uploadResult.fileEntity.fileId);

            this.logger.log(`엑셀 데이터 읽기 완료: ${excelData.length}건`);
            // 3. 데이터 가공
            const processedData = this.processEventHistories(excelData);

            this.logger.log(
                `데이터 가공 완료: 직원 ${processedData.employees.length}명, 이벤트 ${processedData.events.length}건`,
            );
            // 4. 직원 정보 검증
            const employeeNumbers = processedData.employees.map((e) => e.employeeNumber);
            const employees = await this.employeeRepository.findAll({
                where: { employeeNumber: In(employeeNumbers) },
            });

            const employeeMap = new Map<string, any>(employees.map((e) => [e.employeeNumber, e]));

            // 5. 이벤트 데이터 저장 (배치 처리)
            const eventEntities = processedData.events
                .filter((event) => employeeMap.has(event.employeeNumber))
                .map((event) => EventInfo.fromEventInfo(event));

            // 배치 단위로 나눠서 저장 (성능 최적화: 배치 크기 증가)
            const EVENT_BATCH_SIZE = 10000;
            const saveStartTime = Date.now();

            for (let i = 0; i < eventEntities.length; i += EVENT_BATCH_SIZE) {
                const batch = eventEntities.slice(i, i + EVENT_BATCH_SIZE);

                // PostgreSQL의 ON CONFLICT를 사용한 UPSERT
                // 중복 시 업데이트, 아니면 삽입
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(EventInfo)
                    .values(batch)
                    .onConflict(
                        `("employeeNumber", "eventTime") DO UPDATE SET 
                        "employeeName" = EXCLUDED."employeeName",
                        "yyyymmdd" = EXCLUDED."yyyymmdd",
                        "hhmmss" = EXCLUDED."hhmmss"`,
                    )
                    .execute();
            }

            const saveElapsedTime = Date.now() - saveStartTime;
            this.logger.log(`이벤트 데이터 저장 완료: ${eventEntities.length}건 (${saveElapsedTime}ms)`);

            if (!isExternalTransaction) {
                await queryRunner.commitTransaction();
            }

            const totalElapsedTime = Date.now() - totalStartTime;
            this.logger.log(
                `✅ 출입 이벤트 처리 완료 - 총 소요시간: ${totalElapsedTime}ms (${(totalElapsedTime / 1000).toFixed(2)}초)`,
            );

            // 월간 요약은 사용자가 VIEW로 조회할 때 자동 생성됨 (서버리스 타임아웃 방지)

            return {
                success: true,
                fileId: uploadResult.fileEntity.fileId,
                statistics: {
                    totalEmployees: processedData.employees.length,
                    totalEvents: eventEntities.length,
                    year: processedData.year,
                    month: processedData.month,
                },
                performance: {
                    totalTime: totalElapsedTime,
                    totalTimeSeconds: +(totalElapsedTime / 1000).toFixed(2),
                },
            };
        } catch (error) {
            if (!isExternalTransaction) {
                await queryRunner.rollbackTransaction();
            }
            this.logger.error(`출입 이벤트 처리 실패: ${error.message}`, error.stack);
            throw error;
        } finally {
            if (!isExternalTransaction) {
                await queryRunner.release();
            }
        }
    }

    /**
     * 특정 연월의 일일 요약 재생성
     *
     * @param year 년도
     * @param month 월
     * @param externalQueryRunner 외부 트랜잭션 (선택)
     * @returns 생성된 요약 개수
     */
    async regenerateDailySummaries(
        year: string,
        month: string,
        externalQueryRunner?: any,
    ): Promise<{ totalSummaries: number }> {
        const queryRunner = externalQueryRunner || this.dataSource.createQueryRunner();
        const isExternalTransaction = !!externalQueryRunner;

        if (!isExternalTransaction) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        try {
            this.logger.log(`일일 요약 재생성 시작: ${year}-${month}`);

            // 해당 월의 출입 이벤트 조회
            const startDate = `${year}-${month.padStart(2, '0')}-01`;
            const endDate = format(new Date(parseInt(year), parseInt(month), 0), 'yyyy-MM-dd');

            const events = await queryRunner.manager
                .createQueryBuilder(EventInfo, 'ei')
                .where(`SUBSTRING(ei.yyyymmdd, 1, 7) = :yyyymm`, {
                    yyyymm: `${year}-${month.padStart(2, '0')}`,
                })
                .getMany();

            if (events.length === 0) {
                throw new Error(`${year}-${month}의 출입 이벤트 데이터가 없습니다.`);
            }

            this.logger.log(`출입 이벤트 조회 완료: ${events.length}건`);

            // 출입 이벤트를 ExtractEventInfoType 형식으로 변환
            const extractedEvents: ExtractEventInfoType[] = events.map((e) => ({
                employeeName: e.employeeName || '',
                employeeNumber: e.employeeNumber,
                status: '',
                eventTime: e.eventTime,
                yyyymmdd: e.yyyymmdd,
                hhmmss: e.hhmmss,
            }));

            // 직원 정보 조회
            const employeeNumbers = [...new Set(extractedEvents.map((e) => e.employeeNumber))];
            const employees = await this.employeeRepository.findAll({
                where: { employeeNumber: In(employeeNumbers) },
            });

            const employeeMap = new Map<string, any>(employees.map((e) => [e.employeeNumber, e]));

            // 해당 월의 근태 사용 내역 조회
            const employeeIds = Array.from(employeeMap.values()).map((e) => e.id);
            const usedAttendances = await queryRunner.manager
                .createQueryBuilder(UsedAttendance, 'ua')
                .leftJoinAndSelect('ua.attendanceType', 'at')
                .leftJoinAndSelect('ua.employee', 'e')
                .where('e.id IN (:...employeeIds)', { employeeIds })
                .andWhere('ua."usedAt" BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                })
                .getMany();

            this.logger.log(`근태 사용 내역 조회 완료: ${usedAttendances.length}건`);

            // 기존 일일 요약 데이터 삭제 (재생성을 위해)
            const deleteResult = await queryRunner.manager
                .createQueryBuilder()
                .delete()
                .from(DailyEventSummary)
                .where('employeeId IN (:...employeeIds)', { employeeIds })
                .andWhere('date BETWEEN :startDate AND :endDate', { startDate, endDate })
                .execute();

            this.logger.log(`기존 일일 요약 삭제 완료: ${deleteResult.affected}건`);

            // 일일 요약 생성
            const summaries = await this.generateDailySummaries(
                extractedEvents,
                employeeMap,
                usedAttendances,
                year,
                month,
                queryRunner,
            );

            this.logger.log(`일일 요약 재생성 완료: ${summaries.length}건`);

            if (!isExternalTransaction) {
                await queryRunner.commitTransaction();
            }

            return {
                totalSummaries: summaries.length,
            };
        } catch (error) {
            if (!isExternalTransaction) {
                await queryRunner.rollbackTransaction();
            }
            this.logger.error(`일일 요약 재생성 실패: ${error.message}`, error.stack);
            throw error;
        } finally {
            if (!isExternalTransaction) {
                await queryRunner.release();
            }
        }
    }

    /**
     * 근태 사용 엑셀 파일 업로드 및 처리
     *
     * @param file 업로드된 파일
     * @param uploadBy 업로더 ID
     * @param externalQueryRunner 외부 트랜잭션 (선택)
     * @returns 처리 결과
     */
    async uploadAndProcessAttendanceData(file: Express.Multer.File, uploadBy: string, externalQueryRunner?: any) {
        const totalStartTime = Date.now();
        const queryRunner = externalQueryRunner || this.dataSource.createQueryRunner();
        const isExternalTransaction = !!externalQueryRunner;

        if (!isExternalTransaction) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        try {
            this.logger.log(`근태 데이터 파일 업로드 시작: ${file.originalname}`);

            // 1. 파일 업로드
            const uploadResult = await this.fileManagementContext.uploadFile(file, uploadBy, {
                folder: 'attendance-data',
            });

            // 2. 엑셀 데이터 읽기
            const excelData = await this.fileManagementContext.readExcelAsJson(uploadResult.fileEntity.fileId);

            this.logger.log(`엑셀 데이터 읽기 완료: ${excelData.length}건`);

            // 3. 데이터 가공
            const processedData = this.processAttendanceData(excelData);

            this.logger.log(`데이터 가공 완료: 직원 ${processedData.employees.length}명`);

            // 4. 직원 정보 및 근태 유형 조회
            const employeeNumbers = processedData.employees.map((e) => e.employeeNumber);
            const employees = await this.employeeRepository.findAll({
                where: { employeeNumber: In(employeeNumbers) },
            });

            const attendanceTypes = await this.attendanceTypeService.findAll();
            const holidays = await this.holidayInfoService.findAll();

            // 5. 근태 사용 데이터 생성
            const usedAttendanceData = await this.prepareUsedAttendanceData(
                processedData.employees,
                employees,
                attendanceTypes,
                holidays,
            );

            this.logger.log(`근태 사용 데이터 생성 완료: ${usedAttendanceData.length}건`);

            // 6. 저장 (배치 처리 - 성능 최적화)
            const ATTENDANCE_BATCH_SIZE = 1000;
            const saveStartTime = Date.now();
            for (let i = 0; i < usedAttendanceData.length; i += ATTENDANCE_BATCH_SIZE) {
                const batch = usedAttendanceData.slice(i, i + ATTENDANCE_BATCH_SIZE);

                // upsert를 위해 relation을 ID로 변환 (employee, attendanceType 객체 제외)
                const batchWithIds = batch.map((item) => ({
                    usedAt: item.usedAt,
                    employeeId: item.employee?.id,
                    attendanceTypeId: item.attendanceType?.attendanceTypeId,
                }));

                // null 체크 및 필터링
                const validBatch = batchWithIds.filter((item) => {
                    if (!item.employeeId || !item.attendanceTypeId) {
                        this.logger.warn(
                            `근태 데이터 ID 누락 - usedAt: ${item.usedAt}, employeeId: ${item.employeeId}, attendanceTypeId: ${item.attendanceTypeId}`,
                        );
                        return false;
                    }
                    return true;
                });

                if (validBatch.length === 0) {
                    this.logger.warn(`배치 ${i}: 유효한 데이터가 없습니다. 건너뜁니다.`);
                    continue;
                }
                // upsert: employeeId, usedAt, attendanceTypeId가 중복이면 무시, 아니면 삽입
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(UsedAttendance)
                    .values(validBatch)
                    .onConflict(`("employeeId", "usedAt", "attendanceTypeId") DO NOTHING`)
                    .execute();
            }

            const saveElapsedTime = Date.now() - saveStartTime;
            this.logger.log(`근태 사용 데이터 저장 완료: ${usedAttendanceData.length}건 (${saveElapsedTime}ms)`);

            if (!isExternalTransaction) {
                await queryRunner.commitTransaction();
            }

            const totalElapsedTime = Date.now() - totalStartTime;
            this.logger.log(
                `✅ 근태 데이터 처리 완료 - 총 소요시간: ${totalElapsedTime}ms (${(totalElapsedTime / 1000).toFixed(2)}초)`,
            );

            return {
                success: true,
                fileId: uploadResult.fileEntity.fileId,
                statistics: {
                    totalEmployees: processedData.employees.length,
                    totalUsedAttendance: usedAttendanceData.length,
                },
                performance: {
                    totalTime: totalElapsedTime,
                    totalTimeSeconds: +(totalElapsedTime / 1000).toFixed(2),
                },
            };
        } catch (error) {
            if (!isExternalTransaction) {
                await queryRunner.rollbackTransaction();
            }
            this.logger.error(`근태 데이터 처리 실패: ${error.message}`, error.stack);
            throw error;
        } finally {
            if (!isExternalTransaction) {
                await queryRunner.release();
            }
        }
    }

    /**
     * 출입 이벤트 엑셀 데이터 가공
     */
    private processEventHistories(rawExcelData: any[]): {
        year: string;
        month: string;
        employees: ExtractEmployeeInfoType[];
        events: ExtractEventInfoType[];
        departments: string[];
    } {
        try {
            const data = rawExcelData.map((row) => this.translateKeys(row));

            // 년월 추출
            const year = data[0].eventTime.split('-')[0];
            const month = data[0].eventTime.split('-')[1];

            // 직원별로 데이터 그룹화
            const employeeMap = new Map<string, ExtractEmployeeInfoType>();
            const departmentSet = new Set<string>();

            data.forEach((row) => {
                if (!employeeMap.has(row.employeeNumber)) {
                    employeeMap.set(row.employeeNumber, {
                        department: row.department,
                        name: row.name,
                        employeeNumber: row.employeeNumber + '',
                        events: [],
                    });
                }

                const [yyyymmdd, hhmmss] = row.eventTime.split(' ');
                const event: ExtractEventInfoType = {
                    employeeName: row.name,
                    employeeNumber: row.employeeNumber + '',
                    status: row.status,
                    eventTime: row.eventTime,
                    yyyymmdd,
                    hhmmss,
                };

                employeeMap.get(row.employeeNumber)!.events!.push(event);
                departmentSet.add(row.department);
            });

            const employees = Array.from(employeeMap.values());
            const events = employees.flatMap((e) => e.events || []);

            return {
                year,
                month,
                employees,
                events,
                departments: Array.from(departmentSet),
            };
        } catch (error) {
            this.logger.error('출입 이벤트 데이터 가공 실패', error.stack);
            throw new BadRequestException('엑셀 데이터를 읽는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 근태 데이터 가공
     */
    private processAttendanceData(rawExcelData: any[]): {
        employees: ExtractEmployeeInfoType[];
        departments: string[];
    } {
        try {
            const data = rawExcelData.map((row) => this.translateKeys(row));

            const employeeMap = new Map<string, ExtractEmployeeInfoType>();
            const departmentSet = new Set<string>();

            data.forEach((row) => {
                if (!employeeMap.has(row.employeeNumber)) {
                    employeeMap.set(row.employeeNumber, {
                        department: row.department,
                        name: row.name,
                        employeeNumber: row.employeeNumber + '',
                        attendanceRecords: [],
                    });
                }

                const attendanceRecord: AttendanceRecordType = {
                    period: row.period,
                    requestDays: row.requestDays,
                    type: row.type,
                };

                employeeMap.get(row.employeeNumber)!.attendanceRecords!.push(attendanceRecord);
                departmentSet.add(row.department);
            });

            return {
                employees: Array.from(employeeMap.values()),
                departments: Array.from(departmentSet),
            };
        } catch (error) {
            this.logger.error('근태 데이터 가공 실패', error.stack);
            throw new BadRequestException('엑셀 데이터를 읽는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 한글 키를 영문으로 변환
     */
    private translateKeys(obj: any): any {
        const koreanToEnglish = {
            // 출입 이벤트
            위치: 'location',
            발생시각: 'eventTime',
            장치명: 'deviceName',
            상태: 'status',
            카드번호: 'cardNumber',
            이름: 'name',
            사원번호: 'employeeNumber',
            근무조: 'workShift',
            조직: 'department',
            직급: 'position',
            생성구분: 'eventType',
            생성시간: 'creationTime',
            생성자: 'creator',
            생성내용: 'details',
            사진유무: 'photoAvailable',
            비고: 'remarks',
            '출입(발열/마스크)': 'entryCheck',
            // 근태
            기간: 'period',
            신청일수: 'requestDays',
            근태구분: 'type',
            ERP사번: 'employeeNumber',
            부서: 'department',
        };

        const translated = {};
        Object.keys(obj).forEach((key) => {
            const translatedKey = koreanToEnglish[key] || key;
            translated[translatedKey] = obj[key];
        });

        return translated;
    }

    /**
     * 일일 이벤트 요약 생성
     * - 해당 월의 모든 날짜 생성 (주말 포함)
     * - 출입 이벤트 + 근태 이력을 고려하여 지각/결근/조퇴 계산
     */
    private async generateDailySummaries(
        events: ExtractEventInfoType[],
        employeeMap: Map<string, any>,
        usedAttendances: UsedAttendance[],
        year: string,
        month: string,
        queryRunner: any,
    ): Promise<DailyEventSummary[]> {
        // 공휴일 정보 조회
        const holidays = await this.holidayInfoService.findAll();
        const holidaySet = new Set(holidays.map((h) => h.holidayDate));

        // 해당 월의 모든 날짜 생성
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = new Date(yearNum, monthNum - 1, 1); // monthNum - 1 (0-based)
        const endDate = new Date(yearNum, monthNum, 0); // 다음 월의 0일 = 현재 월의 마지막 날
        const allDates = this.generateDateRange(startDate, endDate);

        // 직원별, 날짜별로 이벤트 그룹화
        const eventsByEmployeeAndDate = new Map<string, Map<string, ExtractEventInfoType[]>>();

        events.forEach((event) => {
            if (!employeeMap.has(event.employeeNumber)) return;

            if (!eventsByEmployeeAndDate.has(event.employeeNumber)) {
                eventsByEmployeeAndDate.set(event.employeeNumber, new Map());
            }

            const employeeEvents = eventsByEmployeeAndDate.get(event.employeeNumber)!;
            const dateStr = event.yyyymmdd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            if (!employeeEvents.has(dateStr)) {
                employeeEvents.set(dateStr, []);
            }

            employeeEvents.get(dateStr)!.push(event);
        });

        // 직원별, 날짜별 근태 이력 그룹화 (전달받은 usedAttendances 사용)
        const attendancesByEmployeeAndDate = new Map<string, Map<string, UsedAttendance[]>>();
        usedAttendances.forEach((ua) => {
            const employeeId = ua.employee?.id;
            if (!employeeId) return;

            if (!attendancesByEmployeeAndDate.has(employeeId)) {
                attendancesByEmployeeAndDate.set(employeeId, new Map());
            }
            const employeeAttendances = attendancesByEmployeeAndDate.get(employeeId)!;
            if (!employeeAttendances.has(ua.usedAt)) {
                employeeAttendances.set(ua.usedAt, []);
            }
            employeeAttendances.get(ua.usedAt)!.push(ua);
        });

        // DailyEventSummary 생성
        const summaries: DailyEventSummary[] = [];

        // 모든 직원 × 모든 날짜 조합 생성
        for (const [employeeNumber, employee] of employeeMap) {
            const employeeEvents = eventsByEmployeeAndDate.get(employeeNumber);
            const employeeAttendances = attendancesByEmployeeAndDate.get(employee.id);

            for (const date of allDates) {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayEvents = employeeEvents?.get(dateStr);
                const dayAttendances = employeeAttendances?.get(dateStr);

                const summary = new DailyEventSummary();
                summary.employeeId = employee.id;
                summary.date = dateStr;
                summary.isHoliday = holidaySet.has(dateStr) || this.isWeekend(dateStr);

                // 입사일 및 퇴사일 확인
                const hireDate = employee.hireDate ? format(new Date(employee.hireDate), 'yyyy-MM-dd') : null;
                const terminationDate = employee.terminationDate
                    ? format(new Date(employee.terminationDate), 'yyyy-MM-dd')
                    : null;
                const isBeforeHireDate = hireDate && dateStr < hireDate;
                const isAfterTerminationDate = terminationDate && dateStr > terminationDate;

                // 출입 이벤트가 있는 경우
                if (dayEvents && dayEvents.length > 0) {
                    dayEvents.sort((a, b) => a.hhmmss.localeCompare(b.hhmmss));
                    const earliest = dayEvents[0].hhmmss;
                    const latest = dayEvents[dayEvents.length - 1].hhmmss;

                    summary.enter = earliest;
                    summary.leave = latest;
                    summary.realEnter = earliest;
                    summary.realLeave = latest;

                    // 근태 사용 내역 확인 (정상 근무로 인정되는 근태만)
                    const recognizedAttendances = dayAttendances?.filter(
                        (ua) => ua.attendanceType?.isRecognizedWorkTime === true,
                    );

                    // 오전 근무 인정 여부 (오전 시간대를 커버하는 근태가 있는지)
                    const hasMorningRecognized = recognizedAttendances?.some((ua) => {
                        const startTime = ua.attendanceType?.startWorkTime;
                        const endTime = ua.attendanceType?.endWorkTime;
                        // startWorkTime이 없거나 오전 시간대(9시 이전 또는 9시)를 커버하면 오전 인정
                        return !startTime || startTime <= '09:00:00';
                    });

                    // 오후 근무 인정 여부 (오후 시간대를 커버하는 근태가 있는지)
                    const hasAfternoonRecognized = recognizedAttendances?.some((ua) => {
                        const endTime = ua.attendanceType?.endWorkTime;
                        // endWorkTime이 없거나 오후 시간대(18시 이후 또는 18시)를 커버하면 오후 인정
                        return !endTime || endTime >= '18:00:00';
                    });

                    // 디버깅 로그 (지각 체크 시)
                    if (!summary.isHoliday && earliest > '09:00:00') {
                        this.logger.debug(
                            `[지각 체크] ${dateStr} ${employee.employeeNumber} - ` +
                                `출근: ${earliest}, ` +
                                `근태: ${dayAttendances?.map((ua) => ua.attendanceType?.title).join(', ') || '없음'}, ` +
                                `인정 근태: ${recognizedAttendances?.map((ua) => `${ua.attendanceType?.title}(${ua.attendanceType?.startWorkTime}-${ua.attendanceType?.endWorkTime})`).join(', ') || '없음'}, ` +
                                `오전 인정: ${hasMorningRecognized}, ` +
                                `지각 판정: ${!hasMorningRecognized}`,
                        );
                    }

                    // 지각 체크 (9시 기준) - 입사일~퇴사일 사이이고, 오전 근무가 인정되지 않으면 체크
                    if (
                        !isBeforeHireDate &&
                        !isAfterTerminationDate &&
                        !summary.isHoliday &&
                        !hasMorningRecognized &&
                        earliest > '09:00:00'
                    ) {
                        summary.isLate = true;
                    }

                    // 조퇴 체크 (18시 기준) - 입사일~퇴사일 사이이고, 오후 근무가 인정되지 않으면 체크
                    if (
                        !isBeforeHireDate &&
                        !isAfterTerminationDate &&
                        !summary.isHoliday &&
                        !hasAfternoonRecognized &&
                        latest < '18:00:00'
                    ) {
                        summary.isEarlyLeave = true;
                    }

                    summary.isAbsent = false;
                } else {
                    // 출입 이벤트가 없는 경우
                    if (isBeforeHireDate || isAfterTerminationDate) {
                        // 입사일 이전 또는 퇴사일 이후: 결근 아님
                        summary.isAbsent = false;
                    } else if (summary.isHoliday) {
                        // 주말/공휴일
                        summary.isAbsent = false;
                    } else if (dayAttendances && dayAttendances.length > 0) {
                        // 근태 이력 확인 (정상 근무로 인정되는 근태가 있는지)
                        const hasRecognizedAttendance = dayAttendances.some(
                            (ua) => ua.attendanceType?.isRecognizedWorkTime === true,
                        );

                        if (hasRecognizedAttendance) {
                            // 정상 근무로 인정되는 근태가 있으면 결근 아님
                            summary.isAbsent = false;

                            // 하루 종일 인정되는 근태인 경우 가상 시간 설정 (연차 등)
                            const hasFullDayAttendance = dayAttendances.some((ua) => {
                                const startTime = ua.attendanceType?.startWorkTime;
                                const endTime = ua.attendanceType?.endWorkTime;
                                // startWorkTime과 endWorkTime이 모두 없거나, 전체 시간대를 커버하면 하루 종일
                                return (
                                    ua.attendanceType?.isRecognizedWorkTime &&
                                    (!startTime || startTime <= '09:00:00') &&
                                    (!endTime || endTime >= '18:00:00')
                                );
                            });

                            if (hasFullDayAttendance) {
                                summary.enter = '09:00';
                                summary.leave = '18:00';
                                // realEnter/realLeave는 NULL로 유지 (실제 출입이 없음을 표시)
                            }
                        } else {
                            // 근태가 있지만 정상 근무로 인정되지 않으면 결근
                            summary.isAbsent = true;
                        }
                    } else {
                        // 평일인데 출입 이벤트도 없고 근태 이력도 없으면 결근
                        summary.isAbsent = true;
                    }
                }

                summary.isChecked = true;
                summary.note = '';

                summaries.push(summary);
            }
        }

        // 기존 데이터 조회 (중복 방지)
        const dateEmployeeKeys = summaries.map((s) => `${s.date}_${s.employeeId}`);
        const existingSummaries = await queryRunner.manager.find(DailyEventSummary, {
            where: summaries.map((s) => ({
                date: s.date,
                employeeId: s.employeeId,
            })),
        });

        // 기존 데이터를 Map으로 변환
        const existingMap = new Map<string, DailyEventSummary>();
        existingSummaries.forEach((existing) => {
            const key = `${existing.date}_${existing.employeeId}`;
            existingMap.set(key, existing);
        });

        // 새 데이터와 업데이트 데이터 분리
        const toSave: DailyEventSummary[] = [];
        summaries.forEach((summary) => {
            const key = `${summary.date}_${summary.employeeId}`;
            const existing = existingMap.get(key);

            if (existing) {
                // 기존 데이터 업데이트
                existing.enter = summary.enter;
                existing.leave = summary.leave;
                existing.realEnter = summary.realEnter;
                existing.realLeave = summary.realLeave;
                existing.isHoliday = summary.isHoliday;
                existing.isAbsent = summary.isAbsent;
                existing.isLate = summary.isLate;
                existing.isEarlyLeave = summary.isEarlyLeave;
                existing.isChecked = summary.isChecked;
                existing.note = summary.note;
                toSave.push(existing);
            } else {
                // 새 데이터
                toSave.push(summary);
            }
        });

        // 저장 (배치 처리 - 성능 최적화)
        const SUMMARY_BATCH_SIZE = 1000;
        const saveStartTime = Date.now();

        for (let i = 0; i < toSave.length; i += SUMMARY_BATCH_SIZE) {
            const batch = toSave.slice(i, i + SUMMARY_BATCH_SIZE);
            await queryRunner.manager.save(DailyEventSummary, batch);
        }

        const saveElapsedTime = Date.now() - saveStartTime;
        this.logger.log(`일일 요약 저장 완료: ${toSave.length}건 (${saveElapsedTime}ms)`);

        return toSave;
    }

    /**
     * 근태 사용 데이터 준비
     */
    private async prepareUsedAttendanceData(
        employees: ExtractEmployeeInfoType[],
        employeeEntities: any[],
        attendanceTypes: any[],
        holidays: any[],
    ): Promise<Partial<UsedAttendance>[]> {
        const employeeMap = new Map(employeeEntities.map((e) => [e.employeeNumber, e]));
        const attendanceTypeMap = new Map(attendanceTypes.map((a) => [a.title, a]));
        const holidaySet = new Set(holidays.map((h) => h.holidayDate));

        const usedAttendanceList: Partial<UsedAttendance>[] = [];

        for (const employee of employees) {
            const employeeEntity = employeeMap.get(employee.employeeNumber);
            if (!employeeEntity) {
                this.logger.warn(`존재하지 않는 직원: ${employee.employeeNumber}`);
                continue;
            }

            for (const record of employee.attendanceRecords || []) {
                const attendanceType = attendanceTypeMap.get(record.type);
                if (!attendanceType) {
                    this.logger.warn(`존재하지 않는 근태 구분: ${record.type}`);
                    continue;
                }

                const { startDate, endDate } = this.divideAndParseDate(record.period);
                const dates = this.generateDateRange(startDate, endDate);

                for (const date of dates) {
                    // if (this.isHolidayOrWeekend(date, holidaySet)) continue;

                    usedAttendanceList.push({
                        employee: employeeEntity,
                        attendanceType: attendanceType,
                        usedAt: format(date, 'yyyy-MM-dd'),
                    });
                }
            }
        }

        return usedAttendanceList;
    }

    /**
     * 날짜 범위 생성
     */
    private generateDateRange(start: Date, end: Date): Date[] {
        const dates = [];
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(new Date(date));
        }
        return dates;
    }

    /**
     * 공휴일 또는 주말 확인
     */
    private isHolidayOrWeekend(date: Date, holidaySet: Set<string>): boolean {
        const formattedDate = format(date, 'yyyy-MM-dd');
        return holidaySet.has(formattedDate) || date.getDay() === 0 || date.getDay() === 6;
    }

    /**
     * 주말 확인
     */
    private isWeekend(dateString: string): boolean {
        const date = new Date(dateString);
        return date.getDay() === 0 || date.getDay() === 6;
    }

    /**
     * 기간 문자열 분리 및 파싱
     */
    private divideAndParseDate(period: string): { startDate: Date; endDate: Date } {
        const [startDateStr, endDateStr] = period.split(' ~ ');
        const startDate = parse(startDateStr, 'yyyy-MM-dd', new Date());
        const endDate = parse(endDateStr, 'yyyy-MM-dd', new Date());

        return { startDate, endDate };
    }
}
