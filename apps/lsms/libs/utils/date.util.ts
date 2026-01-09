import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

// 플러그인 등록
dayjs.extend(utc);
dayjs.extend(timezone);

// 기본 타임존 설정
dayjs.tz.setDefault('Asia/Seoul');

class DateUtilWrapper {
    constructor(private date: dayjs.Dayjs) {}

    toDate() {
        return this.date.toDate();
    }

    format(format = 'YYYY-MM-DD HH:mm:ss') {
        return this.date.format(format);
    }

    addMonth(months: number) {
        return new DateUtilWrapper(this.date.add(months, 'month'));
    }

    addDays(days: number) {
        return new DateUtilWrapper(this.date.add(days, 'day'));
    }

    addMinutes(minutes: number) {
        return new DateUtilWrapper(this.date.add(minutes, 'minute'));
    }

    toISOString() {
        return this.date.toISOString();
    }

    toMinutes() {
        return this.date.hour() * 60 + this.date.minute();
    }

    hour(hours: number) {
        return new DateUtilWrapper(this.date.hour(hours));
    }

    minute(minutes: number) {
        return new DateUtilWrapper(this.date.minute(minutes));
    }

    second(seconds: number) {
        return new DateUtilWrapper(this.date.second(seconds));
    }

    getYear() {
        return this.date.year();
    }

    getMonth() {
        return this.date.month() + 1; // dayjs는 0부터 시작하므로 1을 더해줌
    }

    getDate() {
        return this.date.date();
    }

    getDaysInMonth() {
        return this.date.daysInMonth();
    }

    getFirstDayOfMonth() {
        return new DateUtilWrapper(this.date.startOf('month'));
    }

    getLastDayOfMonth() {
        return new DateUtilWrapper(this.date.endOf('month'));
    }
}

export class DateUtil {
    static now() {
        return new DateUtilWrapper(dayjs().tz('Asia/Seoul'));
    }

    static date(date: Date | string | number) {
        return new DateUtilWrapper(dayjs.tz(date, 'Asia/Seoul'));
    }

    static format(date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss') {
        return this.date(date).format(format);
    }

    static parse(dateString: string) {
        return this.date(dateString);
    }

    static addDays(date: Date | string | number, days: number) {
        return this.date(date).addDays(days);
    }

    static addMinutes(date: Date | string | number, minutes: number) {
        return this.date(date).addMinutes(minutes);
    }

    static toISOString(date: Date | string | number) {
        return this.date(date).toISOString();
    }

    static toMinutes(date: Date | string | number) {
        const d = this.date(date);
        return d.toMinutes();
    }

    static fromMinutes(minutes: number) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return this.now().hour(hours).minute(mins).second(0);
    }

    /**
     * 주어진 시간을 30분 단위로 올림합니다.
     * 예: 11:05 → 11:30, 11:35 → 12:00, 11:00 → 11:00
     */
    static ceilTo30Minutes(date: Date | string | number = new Date()) {
        const d = this.date(date);
        const minutes = d.toDate().getMinutes();

        if (minutes === 0) {
            // 정각이면 그대로 반환
            return d.second(0);
        } else if (minutes <= 30) {
            // 1~30분이면 30분으로 설정
            return d.minute(30).second(0);
        } else {
            // 31~59분이면 다음 시간 0분으로 설정
            return d.addMinutes(60 - minutes).second(0);
        }
    }

    /**
     * 주어진 날짜의 연도를 가져옵니다.
     */
    static getYear(date: Date | string | number = new Date()) {
        return this.date(date).getYear();
    }

    /**
     * 주어진 날짜의 월을 가져옵니다. (1-12)
     */
    static getMonth(date: Date | string | number = new Date()) {
        return this.date(date).getMonth();
    }

    /**
     * 주어진 날짜의 일을 가져옵니다.
     */
    static getDate(date: Date | string | number = new Date()) {
        return this.date(date).getDate();
    }

    /**
     * 주어진 날짜가 속한 월의 총 일수를 가져옵니다.
     */
    static getDaysInMonth(date: Date | string | number = new Date()) {
        return this.date(date).getDaysInMonth();
    }

    /**
     * 주어진 날짜가 속한 월의 첫 날을 가져옵니다.
     */
    static getFirstDayOfMonth(date: Date | string | number = new Date()) {
        return this.date(date).getFirstDayOfMonth();
    }

    /**
     * 주어진 날짜가 속한 월의 마지막 날을 가져옵니다.
     */
    static getLastDayOfMonth(date: Date | string | number = new Date()) {
        return this.date(date).getLastDayOfMonth();
    }

    // 알람용 범위에 대한 문자열로 변경
    static toAlarmRangeString(startDate: string, endDate: string) {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        // 날짜가 다르다면 YY.MM.DD(요일) HH:mm ~ YY.MM.DD(요일) HH:mm
        // 날짜가 같다면 YY.MM.DD(요일) HH:mm ~ HH:mm
        if (start.isSame(end, 'day')) {
            return `${this.replaceWeekday(start.format('YY.MM.DD(ddd) HH:mm'))} ~ ${end.format('HH:mm')}`;
        }

        return `${this.replaceWeekday(start.format('YY.MM.DD(ddd) HH:mm'))} ~ ${this.replaceWeekday(end.format('YY.MM.DD(ddd) HH:mm'))}`;
    }
    static replaceWeekday(str: string) {
        return str
            .replace('Mon', '월')
            .replace('Tue', '화')
            .replace('Wed', '수')
            .replace('Thu', '목')
            .replace('Fri', '금')
            .replace('Sat', '토')
            .replace('Sun', '일');
    }
}
