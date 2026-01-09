import { Injectable, Logger } from '@nestjs/common';
import { DomainAttendanceTypeService } from '../../domain/attendance-type/attendance-type.service';
import { AttendanceType } from '../../domain/attendance-type/attendance-type.entity';

/**
 * 근태 유형 컨텍스트
 * - 도메인 서비스를 조합하여 근태 유형 관련 비즈니스 로직 처리
 */
@Injectable()
export class AttendanceTypeContext {
    private readonly logger = new Logger(AttendanceTypeContext.name);

    constructor(private readonly domainAttendanceTypeService: DomainAttendanceTypeService) {}

    /**
     * 모든 근태 유형 조회
     * @returns 근태 유형 목록
     */
    async getAllAttendanceTypes(): Promise<AttendanceType[]> {
        this.logger.log('모든 근태 유형 조회 시작');
        const attendanceTypes = await this.domainAttendanceTypeService.findAll();
        this.logger.log(`근태 유형 ${attendanceTypes.length}개 조회 완료`);
        return attendanceTypes;
    }

    /**
     * 근무 시간이 인정되는 근태 유형만 조회
     * @returns 인정 근태 유형 목록
     */
    async getRecognizedAttendanceTypes(): Promise<AttendanceType[]> {
        this.logger.log('인정 근태 유형 조회 시작');
        const recognizedTypes = await this.domainAttendanceTypeService.findAll({
            where: { isRecognizedWorkTime: true },
        });
        this.logger.log(`인정 근태 유형 ${recognizedTypes.length}개 조회 완료`);
        return recognizedTypes;
    }

    /**
     * ID로 근태 유형 조회
     * @param attendanceTypeId - 근태 유형 ID
     * @returns 근태 유형
     */
    async getAttendanceTypeById(attendanceTypeId: string): Promise<AttendanceType> {
        return await this.domainAttendanceTypeService.findOne({ where: { attendanceTypeId } });
    }

    /**
     * 제목으로 근태 유형 조회
     * @param title - 근태 유형 제목
     * @returns 근태 유형
     */
    async getAttendanceTypeByTitle(title: string): Promise<AttendanceType | null> {
        const types = await this.domainAttendanceTypeService.findAll({
            where: { title },
        });
        return types.length > 0 ? types[0] : null;
    }
}
