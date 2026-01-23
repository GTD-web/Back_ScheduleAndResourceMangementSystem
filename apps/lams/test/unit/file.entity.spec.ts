import { File } from '../../src/refactoring/domain/file/file.entity';
import { FileStatus } from '../../src/refactoring/domain/file/file.types';

describe('File 단위 테스트', () => {
    it('생성 시 기본 상태와 월 패딩이 적용된다', () => {
        const file = new File('test.xlsx', '/uploads/test.xlsx', '원본.xlsx', '2025', '1');

        expect(file.file_name).toBe('test.xlsx');
        expect(file.file_original_name).toBe('원본.xlsx');
        expect(file.file_path).toBe('/uploads/test.xlsx');
        expect(file.year).toBe('2025');
        expect(file.month).toBe('01');
        expect(file.status).toBe(FileStatus.UNREAD);
        expect(file.read_at).toBeNull();
    });

    it('파일명 또는 경로가 비어 있으면 오류가 발생한다', () => {
        expect(() => new File(' ', '/uploads/test.xlsx')).toThrow('파일명은 필수입니다.');
        expect(() => new File('test.xlsx', '  ')).toThrow('파일 경로는 필수입니다.');
    });

    it('업데이트 시 전달된 값만 반영된다', () => {
        const file = new File('test.xlsx', '/uploads/test.xlsx');

        file.업데이트한다('update.xlsx', undefined, '/uploads/update.xlsx', '2026', '12', FileStatus.READ);

        expect(file.file_name).toBe('update.xlsx');
        expect(file.file_path).toBe('/uploads/update.xlsx');
        expect(file.year).toBe('2026');
        expect(file.month).toBe('12');
        expect(file.status).toBe(FileStatus.READ);
    });

    it('읽음처리 시 상태와 읽은 시간이 설정된다', () => {
        const file = new File('test.xlsx', '/uploads/test.xlsx');

        file.읽음처리한다();

        expect(file.status).toBe(FileStatus.READ);
        expect(file.read_at).toBeTruthy();
    });

    it('에러처리 시 상태와 에러 메시지가 설정된다', () => {
        const file = new File('test.xlsx', '/uploads/test.xlsx');

        file.에러처리한다('에러 발생');

        expect(file.status).toBe(FileStatus.ERROR);
        expect(file.error).toBe('에러 발생');
        expect(file.read_at).toBeTruthy();
    });

    it('DTO변환 시 주요 필드가 포함된다', () => {
        const file = new File('test.xlsx', '/uploads/test.xlsx');
        const dto = file.DTO변환한다();

        expect(dto.fileName).toBe('test.xlsx');
        expect(dto.filePath).toBe('/uploads/test.xlsx');
        expect(dto.status).toBe(FileStatus.UNREAD);
    });
});
