import * as fs from 'fs';
import * as path from 'path';

/**
 * 2026년 1월 근태 더미 데이터 생성 스크립트
 */

interface Employee {
    사원번호: string;
    이름: string;
    카드번호: string;
    조직: string;
    직급: string;
    근무조: string;
}

interface AttendanceRecord extends Record<string, string> {
    위치: string;
    발생시각: string;
    장치명: string;
    상태: string;
    카드번호: string;
    이름: string;
    사원번호: string;
    근무조: string;
    조직: string;
    직급: string;
    생성구분: string;
    생성시간: string;
    생성자: string;
    생성내용: string;
    사진유무: string;
    비고: string;
    출입발열마스크: string;
}

interface LeaveRequest extends Record<string, string> {
    No: string;
    신청일: string;
    기간: string;
    신청일수: string;
    신청시간: string;
    사용일수: string;
    부서: string;
    직급: string;
    이름: string;
    ERP사번: string;
    근태항목: string;
    근태구분: string;
    상태: string;
    종결일자: string;
    신청내역: string;
    문서번호: string;
    출장지: string;
    교통수단: string;
    출장목적: string;
    비고: string;
}

// 근태 유형 목록 (init.service.ts에서 확인)
const ATTENDANCE_TYPES = [
    '연차',
    '오전반차',
    '오후반차',
    '공가',
    '오전공가',
    '오후공가',
    '출장',
    '오전출장',
    '오후출장',
    '교육',
    '오전교육',
    '오후교육',
    '경조휴가',
    '보건휴가(오전 반차)',
    '병가',
    '생일오전반차',
    '생일오후반차',
    '대체휴가',
    '오전대체휴가',
    '오후대체휴가',
    '무급휴가',
    '보건휴가(오전반차)',
    '국내출장',
    '국외출장',
    '사외교육',
    '사내교육',
];

// 2026년 1월 정보
const YEAR = 2026;
const MONTH = 1;
const HOLIDAYS = [1]; // 1월 1일 (신정)
const WEEKEND_DAYS = [0, 6]; // 일요일(0), 토요일(6)

// 기본 근무 시간
const DEFAULT_START_TIME = '09:00:00';
const DEFAULT_END_TIME = '18:00:00';

/**
 * 직원 정보 추출
 */
function extractEmployeesFromCSV(csvPath: string): Employee[] {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    const header = lines[0].split(',');
    
    const employeeMap = new Map<string, Employee>();
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 7) continue;
        
        const 사원번호 = values[6]?.trim();
        if (!사원번호) continue;
        
        if (!employeeMap.has(사원번호)) {
            employeeMap.set(사원번호, {
                사원번호,
                이름: values[5]?.trim() || '',
                카드번호: values[4]?.trim() || '',
                조직: values[8]?.trim() || 'Web파트',
                직급: values[9]?.trim() || '연구원',
                근무조: values[7]?.trim() || '정상근무',
            });
        }
    }
    
    return Array.from(employeeMap.values());
}

/**
 * CSV 라인 파싱 (쉼표로 구분, 따옴표 처리)
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result;
}

/**
 * 날짜가 주말인지 확인
 */
function isWeekend(date: Date): boolean {
    return WEEKEND_DAYS.includes(date.getDay());
}

/**
 * 날짜가 공휴일인지 확인
 */
function isHoliday(date: Date): boolean {
    return HOLIDAYS.includes(date.getDate());
}

/**
 * 평일인지 확인
 */
function isWeekday(date: Date): boolean {
    return !isWeekend(date) && !isHoliday(date);
}

/**
 * 랜덤 정수 생성 (min ~ max)
 */
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 시간 문자열 생성 (HH:MM:SS)
 */
function formatTime(hours: number, minutes: number, seconds: number = 0): string {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * 날짜 문자열 생성 (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 날짜시간 문자열 생성 (YYYY-MM-DD HH:MM:SS)
 */
function formatDateTime(date: Date, time: string): string {
    return `${formatDate(date)} ${time}`;
}

/**
 * 출입 상태 랜덤 선택
 */
function getRandomStatus(type: '출근' | '퇴근' | '출입'): string {
    const methods = ['카드', '지문'];
    const method = methods[randomInt(0, 1)];
    return `${type}(${method})`;
}

/**
 * 출입내역 CSV 생성
 */
function generateAttendanceRecords(employees: Employee[]): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    const startDate = new Date(YEAR, MONTH - 1, 1);
    const endDate = new Date(YEAR, MONTH, 0);
    
    // 각 직원별로 날짜별 데이터 생성
    for (const employee of employees) {
        const employeeRecords: AttendanceRecord[] = [];
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const date = new Date(d);
            const dayOfWeek = date.getDay();
            const dayOfMonth = date.getDate();
            
            // 시나리오 결정 (평일만)
            if (!isWeekday(date)) {
                // 주말/공휴일: 랜덤하게 출입 기록 생성 (이슈 발생 안 함)
                if (randomInt(0, 100) < 30) {
                    // 30% 확률로 출입 기록 생성
                    const time = formatTime(randomInt(9, 17), randomInt(0, 59));
                    employeeRecords.push(createAttendanceRecord(employee, date, time, getRandomStatus('출입')));
                }
                continue;
            }
            
            // 평일 시나리오
            const scenario = randomInt(1, 10);
            
            switch (scenario) {
                case 1: // 정상 근무
                    {
                        const 출근시간 = formatTime(randomInt(8, 8), randomInt(30, 59), randomInt(0, 59));
                        const 퇴근시간 = formatTime(randomInt(18, 18), randomInt(0, 30), randomInt(0, 59));
                        employeeRecords.push(createAttendanceRecord(employee, date, 출근시간, getRandomStatus('출근')));
                        
                        // 중간 출입 기록 0~3회
                        const midCount = randomInt(0, 3);
                        for (let i = 0; i < midCount; i++) {
                            const midTime = formatTime(randomInt(10, 17), randomInt(0, 59));
                            employeeRecords.push(createAttendanceRecord(employee, date, midTime, getRandomStatus('출입')));
                        }
                        
                        employeeRecords.push(createAttendanceRecord(employee, date, 퇴근시간, getRandomStatus('퇴근')));
                    }
                    break;
                    
                case 2: // 지각
                    {
                        const 출근시간 = formatTime(9, randomInt(1, 30), randomInt(0, 59));
                        const 퇴근시간 = formatTime(randomInt(18, 19), randomInt(0, 59), randomInt(0, 59));
                        employeeRecords.push(createAttendanceRecord(employee, date, 출근시간, getRandomStatus('출근')));
                        
                        const midCount = randomInt(0, 2);
                        for (let i = 0; i < midCount; i++) {
                            const midTime = formatTime(randomInt(10, 17), randomInt(0, 59));
                            employeeRecords.push(createAttendanceRecord(employee, date, midTime, getRandomStatus('출입')));
                        }
                        
                        employeeRecords.push(createAttendanceRecord(employee, date, 퇴근시간, getRandomStatus('퇴근')));
                    }
                    break;
                    
                case 3: // 조퇴
                    {
                        const 출근시간 = formatTime(randomInt(8, 8), randomInt(30, 59), randomInt(0, 59));
                        const 퇴근시간 = formatTime(randomInt(17, 17), randomInt(0, 59), randomInt(0, 59));
                        employeeRecords.push(createAttendanceRecord(employee, date, 출근시간, getRandomStatus('출근')));
                        
                        const midCount = randomInt(0, 2);
                        for (let i = 0; i < midCount; i++) {
                            const midTime = formatTime(randomInt(10, 16), randomInt(0, 59));
                            employeeRecords.push(createAttendanceRecord(employee, date, midTime, getRandomStatus('출입')));
                        }
                        
                        employeeRecords.push(createAttendanceRecord(employee, date, 퇴근시간, getRandomStatus('퇴근')));
                    }
                    break;
                    
                case 4: // 결근 (출입 기록 없음)
                    // 기록 없음
                    break;
                    
                case 5: // 연차 사용 (출입 기록 없음, 근태신청내역에서 처리)
                    // 기록 없음
                    break;
                    
                case 6: // 오전반차 사용 (출근 기록 없음, 퇴근만)
                    {
                        const 퇴근시간 = formatTime(randomInt(14, 18), randomInt(0, 59), randomInt(0, 59));
                        employeeRecords.push(createAttendanceRecord(employee, date, 퇴근시간, getRandomStatus('퇴근')));
                    }
                    break;
                    
                case 7: // 오후반차 사용 (출근만, 퇴근 기록 없음)
                    {
                        const 출근시간 = formatTime(randomInt(8, 8), randomInt(30, 59), randomInt(0, 59));
                        employeeRecords.push(createAttendanceRecord(employee, date, 출근시간, getRandomStatus('출근')));
                        
                        const midCount = randomInt(0, 2);
                        for (let i = 0; i < midCount; i++) {
                            const midTime = formatTime(randomInt(10, 13), randomInt(0, 59));
                            employeeRecords.push(createAttendanceRecord(employee, date, midTime, getRandomStatus('출입')));
                        }
                    }
                    break;
                    
                case 8: // 중복 시간 근태 (이슈 발생) - 출입 기록은 정상, 근태신청내역에서 처리
                    {
                        const 출근시간 = formatTime(randomInt(8, 8), randomInt(30, 59), randomInt(0, 59));
                        const 퇴근시간 = formatTime(randomInt(18, 18), randomInt(0, 30), randomInt(0, 59));
                        employeeRecords.push(createAttendanceRecord(employee, date, 출근시간, getRandomStatus('출근')));
                        employeeRecords.push(createAttendanceRecord(employee, date, 퇴근시간, getRandomStatus('퇴근')));
                    }
                    break;
                    
                case 9: // 복합 케이스: 지각 + 오후반차 (출근만, 퇴근 기록 없음)
                    {
                        const 출근시간 = formatTime(9, randomInt(1, 30), randomInt(0, 59));
                        employeeRecords.push(createAttendanceRecord(employee, date, 출근시간, getRandomStatus('출근')));
                    }
                    break;
                    
                case 10: // 복합 케이스: 조퇴 + 오전반차 (퇴근만)
                    {
                        const 퇴근시간 = formatTime(randomInt(17, 17), randomInt(0, 59), randomInt(0, 59));
                        employeeRecords.push(createAttendanceRecord(employee, date, 퇴근시간, getRandomStatus('퇴근')));
                    }
                    break;
            }
        }
        
        // 날짜별로 정렬
        employeeRecords.sort((a, b) => {
            const dateA = new Date(a.발생시각);
            const dateB = new Date(b.발생시각);
            return dateA.getTime() - dateB.getTime();
        });
        
        records.push(...employeeRecords);
    }
    
    // 엑셀 읽기 시 비고 컬럼이 전부 비어 있으면 잘릴 수 있으므로 최소 1건은 비고 설정
    if (records.length > 0) {
        records[0].비고 = '-';
    }
    
    return records;
}

/**
 * 출입 기록 생성
 * @param note 비고 (엑셀 읽기 시 컬럼이 비어 있으면 잘릴 수 있으므로 최소 1건 이상 값 지정 권장)
 */
function createAttendanceRecord(
    employee: Employee,
    date: Date,
    time: string,
    status: string,
    note: string = '',
): AttendanceRecord {
    const 발생시각 = formatDateTime(date, time);
    const 생성시간 = formatDateTime(date, formatTime(randomInt(8, 23), randomInt(0, 59), randomInt(0, 59)));
    
    return {
        위치: '루미르주식회사',
        발생시각,
        장치명: '근태리더',
        상태: status,
        카드번호: employee.카드번호 || `990${employee.사원번호}9000702`,
        이름: employee.이름,
        사원번호: employee.사원번호,
        근무조: employee.근무조,
        조직: employee.조직,
        직급: employee.직급,
        생성구분: '기초이벤트',
        생성시간,
        생성자: '',
        생성내용: '',
        사진유무: 'X',
        비고: note,
        출입발열마스크: '',
    };
}

/**
 * 근태신청내역 CSV 생성
 */
function generateLeaveRequests(employees: Employee[]): LeaveRequest[] {
    const requests: LeaveRequest[] = [];
    const startDate = new Date(YEAR, MONTH - 1, 1);
    const endDate = new Date(YEAR, MONTH, 0);
    let requestNo = 1;
    
    for (const employee of employees) {
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const date = new Date(d);
            
            // 평일만 처리
            if (!isWeekday(date)) continue;
            
            // 랜덤하게 근태 신청 생성 (20% 확률)
            if (randomInt(1, 100) > 20) continue;
            
            const scenario = randomInt(1, 8);
            const dateStr = formatDate(date);
            
            switch (scenario) {
                case 1: // 연차
                    requests.push({
                        No: String(requestNo++),
                        신청일: dateStr,
                        기간: `${dateStr} ~ ${dateStr}`,
                        신청일수: '1',
                        신청시간: '',
                        사용일수: '1',
                        부서: employee.조직,
                        직급: employee.직급,
                        이름: employee.이름,
                        ERP사번: employee.사원번호,
                        근태항목: '법정휴가',
                        근태구분: '연차',
                        상태: '결재종결',
                        종결일자: dateStr,
                        신청내역: `연차신청서_${employee.이름}`,
                        문서번호: `휴가-26-${String(requestNo).padStart(4, '0')}`,
                        출장지: '',
                        교통수단: '',
                        출장목적: '',
                        비고: '',
                    });
                    break;
                    
                case 2: // 오전반차
                    requests.push({
                        No: String(requestNo++),
                        신청일: dateStr,
                        기간: `${dateStr} ~ ${dateStr}`,
                        신청일수: '1',
                        신청시간: '',
                        사용일수: '0.5',
                        부서: employee.조직,
                        직급: employee.직급,
                        이름: employee.이름,
                        ERP사번: employee.사원번호,
                        근태항목: '법정휴가',
                        근태구분: '오전반차',
                        상태: '결재종결',
                        종결일자: dateStr,
                        신청내역: `연차신청서_${employee.이름}`,
                        문서번호: `휴가-26-${String(requestNo).padStart(4, '0')}`,
                        출장지: '',
                        교통수단: '',
                        출장목적: '',
                        비고: '',
                    });
                    break;
                    
                case 3: // 오후반차
                    requests.push({
                        No: String(requestNo++),
                        신청일: dateStr,
                        기간: `${dateStr} ~ ${dateStr}`,
                        신청일수: '1',
                        신청시간: '',
                        사용일수: '0.5',
                        부서: employee.조직,
                        직급: employee.직급,
                        이름: employee.이름,
                        ERP사번: employee.사원번호,
                        근태항목: '법정휴가',
                        근태구분: '오후반차',
                        상태: '결재종결',
                        종결일자: dateStr,
                        신청내역: `연차신청서_${employee.이름}`,
                        문서번호: `휴가-26-${String(requestNo).padStart(4, '0')}`,
                        출장지: '',
                        교통수단: '',
                        출장목적: '',
                        비고: '',
                    });
                    break;
                    
                case 4: // 출장
                    requests.push({
                        No: String(requestNo++),
                        신청일: dateStr,
                        기간: `${dateStr} ~ ${dateStr}`,
                        신청일수: '1',
                        신청시간: '',
                        사용일수: '1',
                        부서: employee.조직,
                        직급: employee.직급,
                        이름: employee.이름,
                        ERP사번: employee.사원번호,
                        근태항목: '출장',
                        근태구분: '출장',
                        상태: '결재종결',
                        종결일자: dateStr,
                        신청내역: `출장신청서_${employee.이름}`,
                        문서번호: `출장-26-${String(requestNo).padStart(4, '0')}`,
                        출장지: '서울',
                        교통수단: '지하철',
                        출장목적: '고객 미팅',
                        비고: '',
                    });
                    break;
                    
                case 5: // 중복 시간 근태 (이슈 발생) - 연차와 출장 동시
                    requests.push({
                        No: String(requestNo++),
                        신청일: dateStr,
                        기간: `${dateStr} ~ ${dateStr}`,
                        신청일수: '1',
                        신청시간: '',
                        사용일수: '1',
                        부서: employee.조직,
                        직급: employee.직급,
                        이름: employee.이름,
                        ERP사번: employee.사원번호,
                        근태항목: '법정휴가',
                        근태구분: '연차',
                        상태: '결재종결',
                        종결일자: dateStr,
                        신청내역: `연차신청서_${employee.이름}`,
                        문서번호: `휴가-26-${String(requestNo).padStart(4, '0')}`,
                        출장지: '',
                        교통수단: '',
                        출장목적: '',
                        비고: '',
                    });
                    requests.push({
                        No: String(requestNo++),
                        신청일: dateStr,
                        기간: `${dateStr} ~ ${dateStr}`,
                        신청일수: '1',
                        신청시간: '',
                        사용일수: '1',
                        부서: employee.조직,
                        직급: employee.직급,
                        이름: employee.이름,
                        ERP사번: employee.사원번호,
                        근태항목: '출장',
                        근태구분: '출장',
                        상태: '결재종결',
                        종결일자: dateStr,
                        신청내역: `출장신청서_${employee.이름}`,
                        문서번호: `출장-26-${String(requestNo).padStart(4, '0')}`,
                        출장지: '부산',
                        교통수단: 'KTX',
                        출장목적: '프로젝트 회의',
                        비고: '',
                    });
                    break;
                    
                case 6: // 공가
                    requests.push({
                        No: String(requestNo++),
                        신청일: dateStr,
                        기간: `${dateStr} ~ ${dateStr}`,
                        신청일수: '1',
                        신청시간: '',
                        사용일수: '1',
                        부서: employee.조직,
                        직급: employee.직급,
                        이름: employee.이름,
                        ERP사번: employee.사원번호,
                        근태항목: '공가',
                        근태구분: '공가',
                        상태: '결재종결',
                        종결일자: dateStr,
                        신청내역: `공가신청서_${employee.이름}`,
                        문서번호: `공가-26-${String(requestNo).padStart(4, '0')}`,
                        출장지: '',
                        교통수단: '',
                        출장목적: '',
                        비고: '',
                    });
                    break;
                    
                case 7: // 병가
                    requests.push({
                        No: String(requestNo++),
                        신청일: dateStr,
                        기간: `${dateStr} ~ ${dateStr}`,
                        신청일수: '1',
                        신청시간: '',
                        사용일수: '1',
                        부서: employee.조직,
                        직급: employee.직급,
                        이름: employee.이름,
                        ERP사번: employee.사원번호,
                        근태항목: '병가',
                        근태구분: '병가',
                        상태: '결재종결',
                        종결일자: dateStr,
                        신청내역: `병가신청서_${employee.이름}`,
                        문서번호: `병가-26-${String(requestNo).padStart(4, '0')}`,
                        출장지: '',
                        교통수단: '',
                        출장목적: '',
                        비고: '',
                    });
                    break;
                    
                case 8: // 교육
                    requests.push({
                        No: String(requestNo++),
                        신청일: dateStr,
                        기간: `${dateStr} ~ ${dateStr}`,
                        신청일수: '1',
                        신청시간: '',
                        사용일수: '1',
                        부서: employee.조직,
                        직급: employee.직급,
                        이름: employee.이름,
                        ERP사번: employee.사원번호,
                        근태항목: '교육',
                        근태구분: '교육',
                        상태: '결재종결',
                        종결일자: dateStr,
                        신청내역: `교육신청서_${employee.이름}`,
                        문서번호: `교육-26-${String(requestNo).padStart(4, '0')}`,
                        출장지: '',
                        교통수단: '',
                        출장목적: '',
                        비고: '',
                    });
                    break;
            }
        }
    }
    
    // 엑셀 읽기 시 비고 컬럼이 전부 비어 있으면 잘릴 수 있으므로 최소 1건은 비고 설정
    if (requests.length > 0) {
        requests[0].비고 = '-';
    }
    
    return requests;
}

/**
 * CSV 라인 이스케이프
 */
function escapeCSVValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * CSV 파일 작성 (UTF-8 BOM 포함하여 엑셀 호환성 확보)
 */
function writeCSV<T extends Record<string, string>>(filePath: string, records: T[], headers: string[]): void {
    const lines: string[] = [];
    
    // 헤더
    lines.push(headers.map(escapeCSVValue).join(','));
    
    // 데이터
    for (const record of records) {
        const values = headers.map((header) => record[header] || '');
        lines.push(values.map(escapeCSVValue).join(','));
    }
    
    // UTF-8 BOM 추가 (엑셀에서 한글 깨짐 방지)
    const content = '\uFEFF' + lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${filePath} 생성 완료 (${records.length}건)`);
}

/**
 * 메인 실행 함수
 */
function main() {
    console.log('2026년 1월 근태 더미 데이터 생성 시작...\n');
    
    // 프로젝트 루트 경로
    const projectRoot = path.resolve(__dirname, '..');
    
    // 1. 기존 CSV에서 직원 정보 추출
    const existingCSVPath = path.join(
        projectRoot,
        'storage/local-files/출입내역_수정본.csv',
    );
    
    console.log('1. 직원 정보 추출 중...');
    const employees = extractEmployeesFromCSV(existingCSVPath);
    console.log(`   ${employees.length}명의 직원 정보 추출 완료\n`);
    
    // 2. 출입내역 CSV 생성
    console.log('2. 출입내역 CSV 생성 중...');
    const attendanceRecords = generateAttendanceRecords(employees);
    const attendanceHeaders = [
        '위치',
        '발생시각',
        '장치명',
        '상태',
        '카드번호',
        '이름',
        '사원번호',
        '근무조',
        '조직',
        '직급',
        '생성구분',
        '생성시간',
        '생성자',
        '생성내용',
        '사진유무',
        '비고',
        '출입(발열/마스크)',
    ];
    const attendanceOutputPath = path.join(
        projectRoot,
        'storage/local-files/출입내역_2026년1월.csv',
    );
    writeCSV(attendanceOutputPath, attendanceRecords, attendanceHeaders);
    console.log('');
    
    // 3. 근태신청내역 CSV 생성
    console.log('3. 근태신청내역 CSV 생성 중...');
    const leaveRequests = generateLeaveRequests(employees);
    const leaveHeaders = [
        'No',
        '신청일',
        '기간',
        '신청일수',
        '신청시간',
        '사용일수',
        '부서',
        '직급',
        '이름',
        'ERP사번',
        '근태항목',
        '근태구분',
        '상태',
        '종결일자',
        '신청내역',
        '문서번호',
        '출장지',
        '교통수단',
        '출장목적',
        '비고',
    ];
    const leaveOutputPath = path.join(
        projectRoot,
        'storage/local-files/근태신청내역_2026년1월.csv',
    );
    writeCSV(leaveOutputPath, leaveRequests, leaveHeaders);
    console.log('');
    
    // 4. 데이터 검증
    console.log('4. 데이터 검증 중...');
    console.log(`   - 출입내역: ${attendanceRecords.length}건`);
    console.log(`   - 근태신청내역: ${leaveRequests.length}건`);
    console.log(`   - 날짜 범위: 2026-01-01 ~ 2026-01-31`);
    console.log(`   - 직원 수: ${employees.length}명`);
    
    // 근태 유형 검증
    const usedAttendanceTypes = new Set(leaveRequests.map((r) => r.근태구분));
    const invalidTypes = Array.from(usedAttendanceTypes).filter(
        (type) => !ATTENDANCE_TYPES.includes(type),
    );
    if (invalidTypes.length > 0) {
        console.warn(`   ⚠️  유효하지 않은 근태 유형: ${invalidTypes.join(', ')}`);
    } else {
        console.log('   ✅ 모든 근태 유형이 유효합니다.');
    }
    
    console.log('\n✅ 모든 작업 완료!');
}

// 스크립트 실행
if (require.main === module) {
    main();
}

export { main };
