import { ViewEntity, ViewColumn, DataSource } from 'typeorm';

/**
 * 월간 근태 요약 뷰
 *
 * PostgreSQL VIEW를 통해 실시간으로 집계된 월간 근태 데이터를 제공합니다.
 * - daily_event_summaries와 used_attendance를 조인하여 실시간 집계
 * - 서버리스 환경에서 빠른 응답을 위해 사용
 * - 조회 후 백그라운드에서 실제 테이블(monthly_event_summaries)에 저장
 */
@ViewEntity({
    name: 'monthly_event_summary_view',
    expression: `
        WITH workable_days AS (
            -- 각 월별 평일 수 계산 (월의 1일 ~ 마지막 날)
            SELECT 
                TO_CHAR(month_date, 'YYYY-MM') as yyyymm,
                COUNT(*)::int * 624 as total_workable_time
            FROM (
                SELECT DISTINCT DATE_TRUNC('month', date::date) as month_date
                FROM daily_event_summaries
            ) months
            CROSS JOIN LATERAL (
                SELECT day
                FROM generate_series(
                    month_date,
                    month_date + INTERVAL '1 month' - INTERVAL '1 day',
                    INTERVAL '1 day'
                ) AS day
                WHERE EXTRACT(DOW FROM day) NOT IN (0, 6)
            ) weekdays
            GROUP BY TO_CHAR(month_date, 'YYYY-MM')
        )
        SELECT 
            daily_agg."employeeId",
            daily_agg."employeeNumber",
            daily_agg."employeeName",
            daily_agg.yyyymm,
            daily_agg."workDaysCount",
            COALESCE(weekly_summary.total_weekly_work_time, 0)::int as "totalWorkTime",
            COALESCE(wd.total_workable_time, 0)::int as "totalWorkableTime",
            CASE 
                WHEN daily_agg."workDaysCount" > 0 AND weekly_summary.total_weekly_work_time IS NOT NULL
                THEN ROUND((weekly_summary.total_weekly_work_time::numeric / daily_agg."workDaysCount"), 2)
                ELSE 0
            END as "avgWorkTimes",
            COALESCE(
                daily_agg.base_attendance_count || 
                COALESCE(att_agg.attendance_counts, '{}'::jsonb),
                daily_agg.base_attendance_count
            ) as "attendanceTypeCount",
            COALESCE(weekly_summary.weekly_data, '[]'::jsonb) as "weeklyWorkTimeSummary"
        FROM (
            -- daily_event_summaries 집계 (중복 없이)
            SELECT 
                des."employeeId",
                e."employeeNumber",
                e.name as "employeeName",
                TO_CHAR(DATE_TRUNC('month', des.date::date), 'YYYY-MM') as yyyymm,
                COUNT(CASE 
                    -- 출입 기록이 있거나 정상 근무로 인정되는 근태 사용이 있으면 카운트 (휴일 여부 무관)
                    WHEN des."workTime" IS NOT NULL 
                        OR EXISTS (
                            SELECT 1 FROM used_attendance ua_sub
                            JOIN attendance_types at_sub ON ua_sub."attendanceTypeId" = at_sub."attendanceTypeId"
                            WHERE ua_sub."employeeId" = des."employeeId"
                              AND ua_sub."usedAt" = des.date::text
                              AND at_sub."isRecognizedWorkTime" = true
                        )
                    THEN 1
                END)::int as "workDaysCount",
                jsonb_build_object(
                    '지각', COALESCE(SUM(CASE WHEN des."isLate" THEN 1 ELSE 0 END), 0),
                    '결근', COALESCE(SUM(CASE WHEN des."isAbsent" THEN 1 ELSE 0 END), 0),
                    '조퇴', COALESCE(SUM(CASE WHEN des."isEarlyLeave" THEN 1 ELSE 0 END), 0)
                ) as base_attendance_count
            FROM daily_event_summaries des
            LEFT JOIN employees e ON des."employeeId" = e.id
            GROUP BY 
                des."employeeId", 
                e."employeeNumber", 
                e.name, 
                DATE_TRUNC('month', des.date::date)
        ) daily_agg
        LEFT JOIN workable_days wd ON daily_agg.yyyymm = wd.yyyymm
        LEFT JOIN LATERAL (
            -- 주간 요약 데이터 생성
            SELECT 
                jsonb_agg(
                    jsonb_build_object(
                        'weekNumber', week_num,
                        'startDate', week_start,
                        'endDate', week_end,
                        'weeklyWorkTime', weekly_work_time
                    ) ORDER BY week_num
                ) as weekly_data,
                SUM(weekly_work_time)::int as total_weekly_work_time
            FROM (
                SELECT 
                    EXTRACT(WEEK FROM des2.date::date)::int as week_num,
                    MIN(des2.date::date)::text as week_start,
                    MAX(des2.date::date)::text as week_end,
                    COALESCE(SUM(
                        CASE 
                            -- 실제 출입기록이 있는 경우 (realEnter, realLeave가 NULL이 아님)
                            WHEN des2."realEnter" IS NOT NULL AND des2."realLeave" IS NOT NULL THEN 
                                des2."workTime" + 
                                COALESCE(att_work.total_work_time, 0) -
                                -- 점심시간 차감 (12:00-13:00 포함 시, realEnter/realLeave 기준)
                                CASE 
                                    WHEN des2."realEnter" <= '12:00:00' AND des2."realLeave" >= '13:00:00' 
                                    THEN 60 
                                    ELSE 0 
                                END -
                                -- 저녁식사 시간 차감 (13시간 초과 근무 시)
                                CASE 
                                    WHEN (des2."workTime" + COALESCE(att_work.total_work_time, 0)) >= 780 
                                    THEN 30 
                                    ELSE 0 
                                END
                            -- 출입기록이 없지만 근태 이력이 있는 경우 (연차, 반차 등)
                            WHEN (des2."realEnter" IS NULL OR des2."realLeave" IS NULL) AND att_work.total_work_time > 0
                            THEN att_work.total_work_time
                            ELSE 0
                        END
                    ), 0)::int as weekly_work_time
                FROM daily_event_summaries des2
                LEFT JOIN LATERAL (
                    -- 해당 날짜의 근태 유형별 근무시간 합산
                    SELECT COALESCE(SUM(at."workTime"), 0) as total_work_time
                    FROM used_attendance ua
                    JOIN attendance_types at ON ua."attendanceTypeId" = at."attendanceTypeId"
                    WHERE ua."employeeId" = daily_agg."employeeId"
                      AND ua."usedAt" = des2.date::text
                ) att_work ON true
                WHERE des2."employeeId" = daily_agg."employeeId"
                  AND TO_CHAR(des2.date::date, 'YYYY-MM') = daily_agg.yyyymm
                GROUP BY EXTRACT(WEEK FROM des2.date::date)
            ) weekly_agg
        ) weekly_summary ON true
        LEFT JOIN (
            -- used_attendance 집계 (모든 근태 유형을 0으로 초기화)
            SELECT 
                emp_month."employeeId",
                emp_month.yyyymm,
                jsonb_object_agg(
                    att_types.title, 
                    COALESCE(actual_usage.cnt, 0)
                ) as attendance_counts
            FROM (
                -- 모든 직원-월 조합
                SELECT DISTINCT 
                    des."employeeId",
                    TO_CHAR(DATE_TRUNC('month', des.date::date), 'YYYY-MM') as yyyymm
                FROM daily_event_summaries des
            ) emp_month
            CROSS JOIN (
                -- 모든 근태 유형
                SELECT title FROM attendance_types
            ) att_types
            LEFT JOIN (
                -- 실제 사용한 근태
                SELECT 
                    ua."employeeId",
                    TO_CHAR(TO_DATE(ua."usedAt", 'YYYY-MM-DD'), 'YYYY-MM') as yyyymm,
                    att.title,
                    COUNT(*)::int as cnt
                FROM used_attendance ua
                JOIN attendance_types att ON ua."attendanceTypeId" = att."attendanceTypeId"
                GROUP BY ua."employeeId", TO_CHAR(TO_DATE(ua."usedAt", 'YYYY-MM-DD'), 'YYYY-MM'), att.title
            ) actual_usage 
                ON emp_month."employeeId" = actual_usage."employeeId" 
                AND emp_month.yyyymm = actual_usage.yyyymm
                AND att_types.title = actual_usage.title
            GROUP BY emp_month."employeeId", emp_month.yyyymm
        ) att_agg ON daily_agg."employeeId" = att_agg."employeeId" AND daily_agg.yyyymm = att_agg.yyyymm
    `,
})
export class MonthlyEventSummaryView {
    @ViewColumn()
    employeeId: string;

    @ViewColumn()
    employeeNumber: string;

    @ViewColumn()
    employeeName: string;

    @ViewColumn()
    yyyymm: string;

    @ViewColumn()
    workDaysCount: number;

    @ViewColumn()
    totalWorkTime: number;

    @ViewColumn()
    totalWorkableTime: number;

    @ViewColumn()
    avgWorkTimes: number;

    @ViewColumn()
    attendanceTypeCount: {
        [key: string]: number;
    };

    @ViewColumn()
    weeklyWorkTimeSummary: Array<{
        weekNumber: number;
        startDate: string;
        endDate: string;
        weeklyWorkTime: number;
    }>;
}
