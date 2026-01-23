import { FileContentReflectionHistory } from '../../src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.entity';
import {
    ReflectionStatus,
    ReflectionType,
} from '../../src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.types';

describe('FileContentReflectionHistory 단위 테스트', () => {
    const fileId = '11111111-1111-1111-1111-111111111111';

    it('생성 시 기본 상태와 필드가 설정된다', () => {
        const history = new FileContentReflectionHistory(fileId, ReflectionType.EVENT_HISTORY);

        expect(history.file_id).toBe(fileId);
        expect(history.type).toBe(ReflectionType.EVENT_HISTORY);
        expect(history.status).toBe(ReflectionStatus.PENDING);
        expect(history.reflected_at).toBeNull();
    });

    it('업데이트 시 상태와 데이터가 반영된다', () => {
        const history = new FileContentReflectionHistory(fileId, ReflectionType.ATTENDANCE_DATA);

        history.업데이트한다(ReflectionStatus.PROCESSING, { rows: 10 });

        expect(history.status).toBe(ReflectionStatus.PROCESSING);
        expect(history.data).toEqual({ rows: 10 });
    });

    it('완료처리 시 상태와 반영시간이 설정된다', () => {
        const history = new FileContentReflectionHistory(fileId, ReflectionType.OTHER);

        history.완료처리한다();

        expect(history.status).toBe(ReflectionStatus.COMPLETED);
        expect(history.reflected_at).toBeInstanceOf(Date);
    });

    it('실패처리 시 상태가 FAILED로 변경된다', () => {
        const history = new FileContentReflectionHistory(fileId, ReflectionType.OTHER);

        history.실패처리한다();

        expect(history.status).toBe(ReflectionStatus.FAILED);
    });

    it('처리중처리 시 상태가 PROCESSING으로 변경된다', () => {
        const history = new FileContentReflectionHistory(fileId, ReflectionType.OTHER);

        history.처리중처리한다();

        expect(history.status).toBe(ReflectionStatus.PROCESSING);
    });

    it('DTO변환 시 주요 필드가 포함된다', () => {
        const history = new FileContentReflectionHistory(fileId, ReflectionType.EVENT_HISTORY, { rows: 1 });
        const dto = history.DTO변환한다();

        expect(dto.fileId).toBe(fileId);
        expect(dto.type).toBe(ReflectionType.EVENT_HISTORY);
        expect(dto.status).toBe(ReflectionStatus.PENDING);
        expect(dto.data).toEqual({ rows: 1 });
    });
});
