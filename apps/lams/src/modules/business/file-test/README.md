# 파일 테스트 비즈니스 모듈

파일 관리 컨텍스트의 기능을 테스트할 수 있는 REST API를 제공합니다.

## Base URL

```
/api/file-test
```

## API 목록

### 1. 파일 업로드

**POST** `/api/file-test/upload`

파일을 S3에 업로드하고 DB에 메타데이터를 저장합니다.

**Request (multipart/form-data)**
```
file: [파일]
uploadBy: "user123" (필수)
folder: "reports/2024" (선택)
year: "2024" (선택)
month: "11" (선택)
```

**Response**
```json
{
  "success": true,
  "message": "파일이 성공적으로 업로드되었습니다.",
  "data": {
    "fileId": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "report.xlsx",
    "status": "unread",
    "uploadedAt": "2024-11-19T10:00:00.000Z",
    "s3": {
      "fileKey": "excel-files/1699999999-report.xlsx",
      "bucket": "your-bucket",
      "url": "https://..."
    }
  }
}
```

**cURL 예시**
```bash
curl -X POST http://localhost:3000/api/file-test/upload \
  -F "file=@report.xlsx" \
  -F "uploadBy=user123" \
  -F "folder=reports/2024" \
  -F "year=2024" \
  -F "month=11"
```

---

### 2. 다운로드 URL 생성

**GET** `/api/file-test/:fileId/download-url?expiresIn=3600`

파일 다운로드를 위한 Presigned URL을 생성합니다.

**Response**
```json
{
  "success": true,
  "data": {
    "fileId": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "report.xlsx",
    "downloadUrl": "https://s3.amazonaws.com/...",
    "expiresAt": "2024-11-19T11:00:00.000Z"
  }
}
```

**cURL 예시**
```bash
curl "http://localhost:3000/api/file-test/550e8400-e29b-41d4-a716-446655440000/download-url?expiresIn=3600"
```

---

### 3. 파일 내용 읽기 (메타데이터)

**GET** `/api/file-test/:fileId/read`

파일 내용을 읽고 메타데이터를 반환합니다. 파일 상태가 자동으로 READ로 변경됩니다.

**Response**
```json
{
  "success": true,
  "message": "파일을 성공적으로 읽었습니다.",
  "data": {
    "fileId": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "report.xlsx",
    "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "contentSize": 15234,
    "status": "read",
    "readAt": "2024-11-19T10:30:00.000Z"
  }
}
```

---

### 4. 파일 다운로드 (실제 파일)

**GET** `/api/file-test/:fileId/download`

실제 파일 스트림을 다운로드합니다.

**Response**
- 파일 스트림 (binary)
- Content-Disposition 헤더 포함

**cURL 예시**
```bash
curl -O -J "http://localhost:3000/api/file-test/550e8400-e29b-41d4-a716-446655440000/download"
```

---

### 5. 읽지 않은 파일 목록

**GET** `/api/file-test/unread`

읽지 않은(UNREAD) 상태의 파일 목록을 조회합니다.

**Response**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "fileId": "...",
      "fileName": "report1.xlsx",
      "uploadBy": "user123",
      "uploadedAt": "2024-11-19T10:00:00.000Z",
      "status": "unread"
    }
  ]
}
```

---

### 6. 에러 파일 목록

**GET** `/api/file-test/errors`

에러(ERROR) 상태의 파일 목록을 조회합니다.

**Response**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "fileId": "...",
      "fileName": "corrupted.xlsx",
      "uploadBy": "user123",
      "uploadedAt": "2024-11-19T10:00:00.000Z",
      "status": "error",
      "error": "파일 형식이 잘못되었습니다.",
      "readAt": "2024-11-19T10:30:00.000Z"
    }
  ]
}
```

---

### 7. 연도/월별 파일 조회

**GET** `/api/file-test/by-date?year=2024&month=11`

특정 연도/월의 파일 목록을 조회합니다.

**Response**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "fileId": "...",
      "fileName": "report.xlsx",
      "uploadBy": "user123",
      "uploadedAt": "2024-11-19T10:00:00.000Z",
      "status": "read",
      "year": "2024",
      "month": "11"
    }
  ]
}
```

---

### 8. 사용자별 파일 조회

**GET** `/api/file-test/by-user/:uploadBy`

특정 사용자가 업로드한 파일 목록을 조회합니다.

**Response**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "fileId": "...",
      "fileName": "report.xlsx",
      "uploadedAt": "2024-11-19T10:00:00.000Z",
      "status": "read",
      "year": "2024",
      "month": "11"
    }
  ]
}
```

---

### 9. 파일 삭제

**DELETE** `/api/file-test/:fileId`

S3와 DB에서 파일을 완전히 삭제합니다.

**Response**
```json
{
  "success": true,
  "message": "파일이 성공적으로 삭제되었습니다.",
  "fileId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 테스트 시나리오

### 시나리오 1: 파일 업로드 및 읽기

```bash
# 1. 파일 업로드
FILE_ID=$(curl -X POST http://localhost:3000/api/file-test/upload \
  -F "file=@report.xlsx" \
  -F "uploadBy=user123" | jq -r '.data.fileId')

# 2. 읽지 않은 파일 확인
curl "http://localhost:3000/api/file-test/unread"

# 3. 파일 내용 읽기
curl "http://localhost:3000/api/file-test/$FILE_ID/read"

# 4. 읽지 않은 파일 재확인 (목록에서 사라짐)
curl "http://localhost:3000/api/file-test/unread"
```

### 시나리오 2: 다운로드 URL 생성 및 다운로드

```bash
# 1. Presigned URL 생성
DOWNLOAD_URL=$(curl "http://localhost:3000/api/file-test/$FILE_ID/download-url?expiresIn=300" \
  | jq -r '.data.downloadUrl')

# 2. 생성된 URL로 다운로드
curl -O "$DOWNLOAD_URL"

# 또는 직접 다운로드
curl -O -J "http://localhost:3000/api/file-test/$FILE_ID/download"
```

### 시나리오 3: 파일 조회 및 관리

```bash
# 1. 연도/월별 조회
curl "http://localhost:3000/api/file-test/by-date?year=2024&month=11"

# 2. 사용자별 조회
curl "http://localhost:3000/api/file-test/by-user/user123"

# 3. 에러 파일 확인
curl "http://localhost:3000/api/file-test/errors"

# 4. 파일 삭제
curl -X DELETE "http://localhost:3000/api/file-test/$FILE_ID"
```

## Swagger 문서

서버 실행 후 Swagger UI에서 API를 테스트할 수 있습니다:

```
http://localhost:3000/api/docs
```

## 상태 전이

파일은 다음과 같은 상태를 가집니다:

```
UNREAD (업로드 직후)
  ↓ readFileContent() 호출
READ (파일 읽기 완료)

UNREAD/READ
  ↓ 에러 발생
ERROR (처리 실패)
```

## 주의사항

1. 파일 업로드 시 `uploadBy`는 필수입니다.
2. 읽지 않은 파일을 읽으면 자동으로 상태가 변경됩니다.
3. 파일 삭제는 S3와 DB 모두에서 삭제되므로 주의하세요.
4. Presigned URL은 만료 시간이 지나면 사용할 수 없습니다.

