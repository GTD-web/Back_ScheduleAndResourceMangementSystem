# 파일 관리 컨텍스트 모듈

S3 스토리지와 파일 도메인을 조합하여 파일 업로드, 다운로드, 읽기 기능을 제공하는 컨텍스트 모듈입니다.

## 개요

이 모듈은 다음 두 모듈을 조합하여 파일 관리 기능을 제공합니다:
- **S3 스토리지 모듈**: AWS S3에 파일 저장/조회
- **파일 도메인 모듈**: 파일 메타데이터 DB 관리

## 주요 기능

### 1️⃣ 파일 업로드 및 엔티티 생성
파일을 S3에 업로드하고 DB에 메타데이터를 저장합니다.

```typescript
const result = await fileManagementContext.uploadFile(
  file,
  'user123',
  {
    folder: 'reports/2024',
    year: '2024',
    month: '11',
  }
);

console.log('파일 ID:', result.fileEntity.fileId);
console.log('S3 키:', result.s3Info.fileKey);
console.log('다운로드 URL:', result.s3Info.url);
```

### 2️⃣ 파일 다운로드 URL 생성
저장된 파일의 다운로드 URL을 생성합니다.

```typescript
const result = await fileManagementContext.getFileDownloadUrl(
  'file-uuid',
  3600 // 1시간
);

console.log('다운로드 URL:', result.downloadUrl);
console.log('만료 시간:', result.expiresAt);
```

### 3️⃣ 파일 내용 읽기
S3에서 파일 내용을 직접 가져옵니다.

```typescript
const result = await fileManagementContext.readFileContent('file-uuid');

console.log('파일 크기:', result.content.length);
console.log('Content-Type:', result.contentType);

// ExcelJS로 처리
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(result.content);
```

### 4️⃣ 파일 목록 조회

```typescript
// 읽지 않은 파일
const unreadFiles = await fileManagementContext.getUnreadFiles();

// 에러 파일
const errorFiles = await fileManagementContext.getErrorFiles();

// 연도/월별 파일
const files = await fileManagementContext.getFilesByYearAndMonth('2024', '11');

// 사용자별 파일
const userFiles = await fileManagementContext.getFilesByUploadBy('user123');
```

### 5️⃣ 파일 삭제

```typescript
await fileManagementContext.deleteFile('file-uuid');
// S3와 DB에서 모두 삭제됨
```

## 사용 방법

### 모듈 Import

```typescript
import { Module } from '@nestjs/common';
import { FileManagementModule } from './context/file-management';

@Module({
  imports: [FileManagementModule],
})
export class YourModule {}
```

### 컨트롤러에서 사용

```typescript
import { Controller, Post, Get, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileManagementContext } from './context/file-management';

@Controller('files')
export class FileController {
  constructor(
    private readonly fileManagementContext: FileManagementContext
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any, @Body('uploadBy') uploadBy: string) {
    return await this.fileManagementContext.uploadFile(file, uploadBy);
  }

  @Get(':fileId/download')
  async getDownloadUrl(@Param('fileId') fileId: string) {
    return await this.fileManagementContext.getFileDownloadUrl(fileId);
  }

  @Get(':fileId/content')
  async readContent(@Param('fileId') fileId: string) {
    const result = await this.fileManagementContext.readFileContent(fileId);
    // 파일 내용 처리
    return { size: result.content.length };
  }
}
```

## 자동 상태 관리

- **업로드 시**: 파일 상태가 `UNREAD`로 설정됩니다.
- **내용 읽기 시**: 파일 상태가 자동으로 `READ`로 변경됩니다.
- **에러 발생 시**: 파일 상태가 자동으로 `ERROR`로 변경되고 에러 메시지가 저장됩니다.

## 에러 처리

모든 메서드는 적절한 예외를 발생시킵니다:

- `NotFoundException`: 파일을 찾을 수 없음
- `BadRequestException`: 잘못된 요청 또는 처리 실패

```typescript
try {
  await fileManagementContext.uploadFile(file, uploadBy);
} catch (error) {
  if (error instanceof NotFoundException) {
    console.error('파일을 찾을 수 없습니다');
  } else if (error instanceof BadRequestException) {
    console.error('업로드 실패:', error.message);
  }
}
```

## 의존성

- `S3StorageModule`: S3 파일 저장소 관리
- `DomainFileModule`: 파일 메타데이터 도메인

## 환경 변수

이 모듈을 사용하려면 S3 설정이 필요합니다:

```env
S3_REGION=ap-northeast-2
S3_ENDPOINT=https://s3.example.com
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
```

