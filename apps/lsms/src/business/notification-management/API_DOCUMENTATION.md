# 포털 알림 서비스 API 문서

## 개요

포털 알림 서비스는 FCM(Firebase Cloud Messaging)을 통해 푸시 알림을 전송하고, 알림 내역을 데이터베이스에 저장 및 관리하는 RESTful API를 제공합니다.

**Base URL**: `/api/portal`

**Swagger 문서**: `http://localhost:3001/api/docs` (실행 중일 때)

---

## 목차

1. [건강 상태 확인](#1-건강-상태-확인)
2. [알림 전송](#2-알림-전송)
3. [알림 목록 조회](#3-알림-목록-조회)
4. [알림 읽음 처리](#4-알림-읽음-처리)
5. [전체 읽음 처리](#5-전체-읽음-처리)

---

## 1. 건강 상태 확인

서비스의 건강 상태를 확인합니다.

### 요청

```http
GET /api/portal/health
```

### 응답

**성공 (200 OK)**

```json
{
  "status": "ok",
  "service": "portal-notification",
  "timestamp": "2025-10-31T15:00:00.000Z"
}
```

---

## 2. 알림 전송

FCM을 통해 알림을 전송하고 DB에 내역을 저장합니다.

### 요청

```http
POST /api/portal/notifications/send
Content-Type: application/json
```

**Request Body**

```json
{
  "sender": "user001",
  "title": "새로운 공지사항이 등록되었습니다",
  "content": "인사팀에서 새로운 공지사항을 등록했습니다.",
  "recipientIds": ["user002", "user003", "user004"],
  "tokens": [
    "fcm_token_1",
    "fcm_token_2",
    "fcm_token_3"
  ],
  "sourceSystem": "portal",
  "linkUrl": "/portal/announcements/123",
  "metadata": {
    "type": "announcement",
    "priority": "high"
  }
}
```

**필드 설명**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `sender` | string | ✅ | 발신자 ID (사번) |
| `title` | string | ✅ | 알림 제목 |
| `content` | string | ✅ | 알림 내용 |
| `recipientIds` | string[] | ✅ | 수신자 사용자 ID 목록 (사번), 최대 500개 |
| `tokens` | string[] | ✅ | 수신자 FCM 토큰 목록, `recipientIds`와 순서 일치해야 함 |
| `sourceSystem` | string | ❌ | 소스 시스템 (기본값: "portal") |
| `linkUrl` | string | ❌ | 알림 클릭 시 이동할 URL |
| `metadata` | object | ❌ | 추가 메타데이터 (JSON) |

### 응답

**성공 (201 Created)**

```json
{
  "success": true,
  "message": "알림 전송 완료: 성공 3건, 실패 0건",
  "notificationIds": [
    "22e6acc2-03be-4d69-a691-1b5c4e15e119",
    "33f7bdd3-14cf-5d7a-b802-2c6d5f26f22a",
    "44g8cee4-25dg-6e8b-c913-3d7e6g37g33b"
  ],
  "successCount": 3,
  "failureCount": 0
}
```

**에러 응답 (400 Bad Request)**

```json
{
  "statusCode": 400,
  "message": "수신자 ID 목록과 FCM 토큰 목록의 길이가 일치하지 않습니다.",
  "error": "Bad Request"
}
```

### 제한사항

- 한 번에 최대 **500개**의 알림까지 전송 가능
- `recipientIds`와 `tokens` 배열의 길이는 반드시 일치해야 함
- 최소 1명 이상의 수신자가 필요함

### 예시

```bash
curl -X POST http://localhost:3001/api/portal/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "user001",
    "title": "새로운 공지사항",
    "content": "인사팀에서 새로운 공지사항을 등록했습니다.",
    "recipientIds": ["user002", "user003"],
    "tokens": ["fcm_token_1", "fcm_token_2"]
  }'
```

---

## 3. 알림 목록 조회

특정 사용자의 알림 목록을 조회합니다.

### 요청

```http
GET /api/portal/notifications/{recipientId}?isRead={isRead}&skip={skip}&take={take}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `recipientId` | string | ✅ | 수신자 ID (사번) |

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `isRead` | boolean | ❌ | - | 읽음 여부 필터 (`true`/`false`) |
| `skip` | number | ❌ | 0 | 건너뛸 개수 (페이지네이션) |
| `take` | number | ❌ | 20 | 가져올 개수 (페이지네이션) |

### 응답

**성공 (200 OK)**

```json
{
  "notifications": [
    {
      "id": "22e6acc2-03be-4d69-a691-1b5c4e15e119",
      "sourceSystem": "portal",
      "sender": "user001",
      "recipient": "user002",
      "title": "새로운 공지사항이 등록되었습니다",
      "content": "인사팀에서 새로운 공지사항을 등록했습니다.",
      "metadata": {
        "type": "announcement",
        "priority": "high"
      },
      "isRead": false,
      "isSent": true,
      "createdAt": "2025-10-31T15:00:00.000Z",
      "updatedAt": "2025-10-31T15:00:05.000Z"
    }
  ],
  "total": 15,
  "skip": 0,
  "take": 20
}
```

### 예시

```bash
# 읽지 않은 알림만 조회
curl "http://localhost:3001/api/portal/notifications/user002?isRead=false&skip=0&take=20"

# 모든 알림 조회 (2페이지)
curl "http://localhost:3001/api/portal/notifications/user002?skip=20&take=20"
```

---

## 4. 알림 읽음 처리

특정 알림을 읽음 상태로 변경합니다.

### 요청

```http
PATCH /api/portal/notifications/{notificationId}/read
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `notificationId` | string | ✅ | 알림 ID (UUID) |

### 응답

**성공 (200 OK)**

```json
{
  "id": "22e6acc2-03be-4d69-a691-1b5c4e15e119",
  "sourceSystem": "portal",
  "sender": "user001",
  "recipient": "user002",
  "title": "새로운 공지사항이 등록되었습니다",
  "content": "인사팀에서 새로운 공지사항을 등록했습니다.",
  "isRead": true,
  "isSent": true,
  "createdAt": "2025-10-31T15:00:00.000Z",
  "updatedAt": "2025-10-31T15:05:00.000Z"
}
```

### 예시

```bash
curl -X PATCH http://localhost:3001/api/portal/notifications/22e6acc2-03be-4d69-a691-1b5c4e15e119/read
```

---

## 5. 전체 읽음 처리

특정 받은 사람의 모든 읽지 않은 알림을 읽음 상태로 변경합니다.

### 요청

```http
PATCH /api/portal/notifications/{recipientId}/read-all
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `recipientId` | string | ✅ | 수신자 ID (사번) |

### 응답

**성공 (200 OK)**

```json
{
  "success": true,
  "message": "3건의 알림이 읽음 처리되었습니다.",
  "updatedCount": 3
}
```

### 예시

```bash
curl -X PATCH http://localhost:3001/api/portal/notifications/user002/read-all
```

---

## 에러 처리

### 공통 에러 응답 형식

```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

### 주요 에러 코드

| HTTP 상태 코드 | 설명 |
|----------------|------|
| `400` | 잘못된 요청 (유효성 검사 실패 등) |
| `404` | 리소스를 찾을 수 없음 |
| `500` | 서버 내부 오류 |

---

## 데이터 모델

### Notification 엔티티

```typescript
{
  id: string;              // UUID
  sourceSystem: string;    // 소스 시스템
  sender: string;         // 발신자 ID (사번)
  recipient: string;       // 수신자 ID (사번)
  title: string;          // 제목
  content: string;        // 내용
  metadata?: object;       // 메타데이터 (JSON)
  isRead: boolean;        // 읽음 여부
  isSent: boolean;        // 전송 여부
  createdAt: Date;         // 생성 일시
  updatedAt: Date;        // 수정 일시
}
```

---

## 주의사항

1. **FCM 토큰 관리**
   - FCM 토큰이 만료되거나 무효화될 수 있음
   - 클라이언트에서 정기적으로 토큰 갱신 필요
   - 전송 실패 시 로그 확인 후 토큰 갱신 권장

2. **대량 전송**
   - 한 번에 최대 500개까지만 전송 가능
   - 대량 전송 시 응답 시간이 늘어날 수 있음 (작업 큐 사용 권장)

3. **읽음 처리**
   - 읽지 않은 알림만 필터링하여 처리
   - 이미 읽은 알림은 건너뜀

4. **페이지네이션**
   - 기본값: `skip=0`, `take=20`
   - 대량 데이터 조회 시 페이지네이션 활용 권장

---

## Swagger UI

실행 중인 서버의 Swagger UI에서 인터랙티브하게 API를 테스트할 수 있습니다:

```
http://localhost:3001/api/docs
```

Swagger UI에서는:
- 모든 엔드포인트 확인
- 요청/응답 스키마 확인
- 직접 API 호출 테스트
- 인증 설정 (Bearer Token 등)

---

## 연락처 및 지원

문제가 발생하거나 추가 기능이 필요한 경우, 개발 팀에 문의하세요.

