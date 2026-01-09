# S3 스토리지 모듈

AWS S3를 사용하여 엑셀 파일을 관리하는 통합 모듈입니다.

## 개요

이 모듈은 AWS S3와 연동하여 엑셀 파일(.xlsx, .xls, .csv)의 업로드, 다운로드, 삭제, 목록 조회 기능을 제공합니다.

## 기능

- ✅ 엑셀 파일 업로드 (.xlsx, .xls, .csv)
- ✅ 파일 다운로드 URL 생성 (Presigned URL)
- ✅ 파일 삭제
- ✅ 파일 목록 조회
- ✅ 파일 유효성 검증 (크기, 확장자, MIME 타입)
- ✅ 파일 스트림 다운로드

## 설치 및 설정

### 1. 환경 변수 설정

`.env` 파일에 다음 환경 변수를 추가하세요:

```env
# S3 스토리지 설정
S3_REGION=ap-northeast-2
S3_ENDPOINT=https://s3.example.com
S3_ACCESS_KEY=your_access_key_id
S3_SECRET_KEY=your_secret_access_key
S3_BUCKET_NAME=your_bucket_name
```

**참고**: AWS S3를 사용하는 경우 `S3_ENDPOINT`는 생략 가능합니다. MinIO 등 S3 호환 스토리지를 사용하는 경우 엔드포인트를 설정하세요.

### 2. 모듈 Import

사용하려는 모듈에 `S3StorageModule`을 import하세요:

```typescript
import { Module } from '@nestjs/common';
import { S3StorageModule } from './integrations/s3-storage';

@Module({
    imports: [S3StorageModule],
    // ...
})
export class YourModule {}
```

## 사용 방법

### 서비스 주입

```typescript
import { Injectable } from '@nestjs/common';
import { S3StorageService } from './integrations/s3-storage';

@Injectable()
export class YourService {
    constructor(private readonly s3StorageService: S3StorageService) {}

    // 서비스 메서드...
}
```

### 1. 파일 업로드

```typescript
import { UploadedFile } from './integrations/s3-storage';

async uploadExcelFile(file: UploadedFile) {
  const result = await this.s3StorageService.uploadExcel(file, {
    fileName: 'report.xlsx',
    folder: 'reports/2024',
    metadata: {
      department: 'HR',
      type: 'employee-report',
    },
  });

  console.log('업로드 완료:', result.fileKey);
  console.log('다운로드 URL:', result.url);
}
```

### 2. 파일 다운로드 URL 생성

```typescript
async getDownloadUrl(fileKey: string) {
  const result = await this.s3StorageService.getFileDownloadUrl({
    fileKey: 'excel-files/1699999999-report.xlsx',
    expiresIn: 3600, // 1시간
  });

  console.log('다운로드 URL:', result.url);
  console.log('만료 시간:', result.expiresAt);
}
```

### 3. 파일 삭제

```typescript
async deleteFile(fileKey: string) {
  const result = await this.s3StorageService.deleteFile({
    fileKey: 'excel-files/1699999999-report.xlsx',
  });

  console.log('삭제 완료:', result.message);
}
```

### 4. 파일 목록 조회

```typescript
async listExcelFiles() {
  const result = await this.s3StorageService.listFiles({
    prefix: 'excel-files',
    maxKeys: 100,
  });

  console.log('총 파일 개수:', result.count);
  result.files.forEach((file) => {
    console.log(`- ${file.key} (${file.size} bytes)`);
  });
}
```

### 5. 파일 스트림 다운로드 (직접 파일 내용 가져오기)

```typescript
async downloadAndProcessFile(fileKey: string) {
  const buffer = await this.s3StorageService.downloadFileStream(fileKey);

  // ExcelJS로 파일 처리
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet(1);
  // 워크시트 처리...
}
```

### 6. 업로드용 Presigned URL 생성 (클라이언트 직접 업로드)

```typescript
async generateUploadUrl(mimeType: string) {
  const result = await this.s3StorageService.generatePresignedUrlForUpload(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xlsx',
    120, // 2분
  );

  console.log('업로드 URL:', result.url);
  console.log('파일 키:', result.fileKey);

  // 클라이언트에 URL과 fileKey 전달
  return result;
}
```

### 7. 파일 존재 여부 확인

```typescript
async checkFile(fileKey: string) {
  const exists = await this.s3StorageService.checkFileExists(fileKey);

  if (exists) {
    console.log('파일이 존재합니다.');
  } else {
    console.log('파일을 찾을 수 없습니다.');
  }
}
```

### 8. 파일의 공개 URL 가져오기 (MinIO 등)

```typescript
async getPublicUrl(fileKey: string) {
  const publicUrl = this.s3StorageService.getFileUrl(fileKey);
  console.log('공개 URL:', publicUrl);
  // 예: https://object/public.example.com/bucket-name/excel-files/file.xlsx
}
```

## 컨트롤러 예시

```typescript
import { Controller, Post, Get, Delete, Body, Param, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3StorageService } from './integrations/s3-storage';

@Controller('files')
export class FileController {
    constructor(private readonly s3StorageService: S3StorageService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: UploadedFile) {
        return await this.s3StorageService.uploadExcel(file);
    }

    @Get('download/:fileKey')
    async getDownloadUrl(@Param('fileKey') fileKey: string) {
        return await this.s3StorageService.getFileDownloadUrl({ fileKey });
    }

    @Delete(':fileKey')
    async deleteFile(@Param('fileKey') fileKey: string) {
        return await this.s3StorageService.deleteFile({ fileKey });
    }

    @Get('list')
    async listFiles(@Query('prefix') prefix?: string) {
        return await this.s3StorageService.listFiles({ prefix });
    }
}
```

## 제한사항

- **파일 크기**: 최대 10MB
- **파일 형식**: .xlsx, .xls, .csv만 지원
- **Presigned URL 만료 시간**: 기본 1시간 (변경 가능)

## 상수

모듈에서 사용되는 상수들은 `s3-storage.constants.ts`에 정의되어 있습니다:

- `EXCEL_MIME_TYPES`: 지원하는 MIME 타입
- `EXCEL_EXTENSIONS`: 지원하는 파일 확장자
- `MAX_FILE_SIZE`: 최대 파일 크기 (10MB)
- `S3_FOLDERS`: 기본 폴더 경로
- `PRESIGNED_URL_EXPIRATION`: Presigned URL 만료 시간 (1시간)

## 에러 처리

모든 메서드는 적절한 예외를 throw합니다:

- `BadRequestException`: 잘못된 요청 (파일 형식, 크기 등)
- `InternalServerErrorException`: S3 작업 실패

```typescript
try {
    await this.s3StorageService.uploadExcel(file);
} catch (error) {
    if (error instanceof BadRequestException) {
        console.error('잘못된 요청:', error.message);
    } else {
        console.error('서버 오류:', error.message);
    }
}
```

## 주의사항

1. **AWS 자격 증명**: AWS 자격 증명을 안전하게 관리하세요. 프로덕션 환경에서는 IAM 역할 사용을 권장합니다.

2. **S3 버킷 권한**: S3 버킷에 다음 권한이 필요합니다:

    - `s3:PutObject` (업로드)
    - `s3:GetObject` (다운로드)
    - `s3:DeleteObject` (삭제)
    - `s3:ListBucket` (목록 조회)

3. **파일 이름 처리**: 특수 문자가 포함된 파일 이름은 자동으로 sanitize됩니다.

4. **비용**: S3 사용량에 따라 AWS 비용이 발생할 수 있습니다.

## DTO 구조

### UploadExcelDto

```typescript
{
  fileName: string;          // 파일 이름
  folder?: string;           // 저장 폴더 (선택)
  metadata?: Record<string, string>; // 메타데이터 (선택)
}
```

### GetFileDto

```typescript
{
  fileKey: string;           // S3 파일 키
  expiresIn?: number;        // URL 만료 시간(초)
}
```

### DeleteFileDto

```typescript
{
    fileKey: string; // 삭제할 파일 키
}
```

### ListFilesDto

```typescript
{
  prefix?: string;           // 조회할 폴더 경로
  maxKeys?: number;          // 최대 조회 개수 (기본: 100)
}
```

## 개발 팀 문의

문제가 발생하거나 추가 기능이 필요한 경우, 개발 팀에 문의하세요.
