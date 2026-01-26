# 엑셀 리더 모듈

ExcelJS를 사용하여 업로드된 엑셀 파일을 읽고 파싱하는 통합 모듈입니다.

## 개요

이 모듈은 엑셀 파일(.xlsx, .xls, .csv)을 읽고 데이터를 추출하는 기능을 제공합니다.

## 기능

- ✅ 엑셀 파일 정보 조회 (워크시트 목록, 행/열 수)
- ✅ 워크시트 데이터 읽기
- ✅ 여러 워크시트 동시 읽기
- ✅ 헤더/데이터 자동 분리
- ✅ JSON 객체 배열로 변환
- ✅ 데이터 유효성 검증
- ✅ CSV 형식 변환
- ✅ 날짜, 수식, 하이퍼링크 처리

## 설치

이미 설치된 ExcelJS를 사용합니다:

```json
{
  "dependencies": {
    "exceljs": "^4.4.0"
  }
}
```

## 사용 방법

### 모듈 Import

```typescript
import { Module } from '@nestjs/common';
import { ExcelReaderModule } from './integrations/excel-reader';

@Module({
  imports: [ExcelReaderModule],
})
export class YourModule {}
```

### 1. 엑셀 파일 정보 조회

```typescript
import { ExcelReaderService } from './integrations/excel-reader';

@Injectable()
export class YourService {
  constructor(private readonly excelReader: ExcelReaderService) {}

  async getExcelInfo(buffer: Buffer) {
    const info = await this.excelReader.getFileInfo(buffer);
    
    console.log('총 워크시트:', info.worksheetCount);
    info.worksheets.forEach(sheet => {
      console.log(`- ${sheet.name}: ${sheet.rowCount}행, ${sheet.columnCount}열`);
    });
  }
}
```

### 2. 워크시트 데이터 읽기

```typescript
// 첫 번째 워크시트 읽기 (기본)
const data = await this.excelReader.readWorksheet(buffer);

// 특정 워크시트 읽기 (이름으로)
const data = await this.excelReader.readWorksheet(buffer, {
  sheetName: 'Sheet1',
  hasHeader: true,
  startRow: 1,
});

// 특정 워크시트 읽기 (인덱스로)
const data = await this.excelReader.readWorksheet(buffer, {
  sheetIndex: 0,
  hasHeader: true,
});

// 특정 범위만 읽기
const data = await this.excelReader.readWorksheet(buffer, {
  startRow: 2,
  endRow: 100,
  hasHeader: false,
});
```

**결과:**
```typescript
{
  sheetName: 'Sheet1',
  headers: ['이름', '나이', '부서'],
  data: [
    ['홍길동', 30, '개발팀'],
    ['김철수', 25, '영업팀'],
  ],
  records: [
    { 이름: '홍길동', 나이: 30, 부서: '개발팀' },
    { 이름: '김철수', 나이: 25, 부서: '영업팀' },
  ],
  rowCount: 2,
  columnCount: 3,
}
```

### 3. 여러 워크시트 읽기

```typescript
// 모든 워크시트 읽기
const allData = await this.excelReader.readMultipleWorksheets(buffer);

// 특정 워크시트들만 읽기
const selectedData = await this.excelReader.readMultipleWorksheets(
  buffer,
  ['Sheet1', 'Sheet2']
);

allData.forEach(sheetData => {
  console.log(`${sheetData.sheetName}: ${sheetData.rowCount}행`);
});
```

### 4. 데이터 유효성 검증

```typescript
const data = await this.excelReader.readWorksheet(buffer, {
  hasHeader: true,
});

// 검증 규칙 정의
const rules = [
  {
    column: '이름',
    required: true,
    type: 'string' as const,
  },
  {
    column: '나이',
    required: true,
    type: 'number' as const,
    min: 0,
    max: 150,
  },
  {
    column: '이메일',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  },
  {
    column: '부서',
    enum: ['개발팀', '영업팀', '인사팀'],
  },
];

const validation = this.excelReader.validateData(data, rules);

if (!validation.valid) {
  console.log('검증 실패:', validation.errors);
  validation.errors.forEach(error => {
    console.log(`행 ${error.row}, 열 ${error.column}: ${error.message}`);
  });
}
```

### 5. CSV 변환

```typescript
const data = await this.excelReader.readWorksheet(buffer);
const csv = await this.excelReader.convertToCSV(data);

// CSV 파일로 저장하거나 응답으로 반환
res.set({
  'Content-Type': 'text/csv',
  'Content-Disposition': 'attachment; filename="data.csv"',
});
res.send(csv);
```

### 6. 파일 관리 컨텍스트와 함께 사용

```typescript
import { FileManagementContext } from './context/file-management';
import { ExcelReaderService } from './integrations/excel-reader';

@Injectable()
export class DataProcessService {
  constructor(
    private readonly fileManagement: FileManagementContext,
    private readonly excelReader: ExcelReaderService,
  ) {}

  async processExcelFile(fileId: string) {
    // 1. S3에서 파일 다운로드
    const fileContent = await this.fileManagement.readFileContent(fileId);
    
    // 2. 엑셀 데이터 읽기
    const data = await this.excelReader.readWorksheet(fileContent.content, {
      hasHeader: true,
    });
    
    // 3. 데이터 검증
    const validation = this.excelReader.validateData(data, rules);
    
    if (!validation.valid) {
      throw new Error('데이터 검증 실패');
    }
    
    // 4. 데이터 처리
    for (const record of data.records!) {
      await this.processRecord(record);
    }
    
    return {
      processed: data.rowCount,
      sheetName: data.sheetName,
    };
  }
}
```

## 옵션

### ReadExcelOptionsDto

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `sheetName` | string | - | 읽을 워크시트 이름 |
| `sheetIndex` | number | 0 | 읽을 워크시트 인덱스 (0부터) |
| `startRow` | number | 1 | 시작 행 번호 (1부터) |
| `endRow` | number | - | 종료 행 번호 |
| `hasHeader` | boolean | true | 첫 행이 헤더인지 여부 |
| `includeEmpty` | boolean | false | 빈 셀 포함 여부 |

### CellValidationRule

| 속성 | 타입 | 설명 |
|------|------|------|
| `column` | string \| number | 검증할 열 |
| `required` | boolean | 필수 여부 |
| `type` | string | 데이터 타입 (string, number, date, boolean) |
| `min` | number | 최소값 (숫자) |
| `max` | number | 최대값 (숫자) |
| `pattern` | string | 정규식 패턴 |
| `enum` | any[] | 허용된 값 목록 |

## 제한사항

- **최대 행 수**: 100,000행 (메모리 보호)
- **파일 형식**: .xlsx, .xls, .csv
- **대용량 파일**: 스트리밍 방식이 아니므로 메모리에 로드됨

## 지원하는 셀 타입

- ✅ 텍스트
- ✅ 숫자
- ✅ 날짜
- ✅ 불린
- ✅ 수식 (결과값)
- ✅ 하이퍼링크
- ✅ Rich Text

## 에러 처리

```typescript
try {
  const data = await this.excelReader.readWorksheet(buffer);
} catch (error) {
  if (error instanceof BadRequestException) {
    // 파일이 손상되었거나 형식이 잘못됨
    console.error('엑셀 파일 읽기 실패:', error.message);
  }
}
```

## 완전한 예시

```typescript
import { Injectable } from '@nestjs/common';
import { FileManagementContext } from './context/file-management';
import { ExcelReaderService } from './integrations/excel-reader';

@Injectable()
export class EmployeeImportService {
  constructor(
    private readonly fileManagement: FileManagementContext,
    private readonly excelReader: ExcelReaderService,
  ) {}

  async importEmployees(fileId: string) {
    // 1. 파일 다운로드
    const { content } = await this.fileManagement.readFileContent(fileId);
    
    // 2. 파일 정보 확인
    const info = await this.excelReader.getFileInfo(content);
    console.log(`워크시트 ${info.worksheetCount}개 발견`);
    
    // 3. 데이터 읽기
    const data = await this.excelReader.readWorksheet(content, {
      sheetName: '직원목록',
      hasHeader: true,
    });
    
    // 4. 검증
    const validation = this.excelReader.validateData(data, [
      { column: '사번', required: true, type: 'string' },
      { column: '이름', required: true, type: 'string' },
      { column: '부서', enum: ['개발팀', '영업팀', '인사팀'] },
    ]);
    
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }
    
    // 5. 데이터 처리
    const imported = [];
    for (const record of data.records!) {
      const employee = await this.createEmployee(record);
      imported.push(employee);
    }
    
    return {
      success: true,
      imported: imported.length,
      total: data.rowCount,
    };
  }
}
```

## 주의사항

1. 대용량 파일(수만 행 이상)은 메모리 사용량이 높을 수 있습니다.
2. 수식은 결과값만 반환되며, 수식 자체는 읽지 않습니다.
3. 병합된 셀은 첫 번째 셀의 값만 읽힙니다.
4. 이미지, 차트 등은 지원하지 않습니다.

## 문의

문제가 발생하거나 추가 기능이 필요한 경우, 개발 팀에 문의하세요.

