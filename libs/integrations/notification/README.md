# 알림 서비스 통합 모듈

포털 알림 서버와 통신하여 FCM 푸시 알림을 전송하는 NestJS 모듈입니다.

## 환경 변수 설정

`.env` 파일에 다음 환경 변수를 추가해주세요:

```bash
NOTIFICATION_SERVICE_URL=http://localhost:3001/api/portal
```

## 사용 방법

### 1. 기본 사용

컨트롤러나 서비스에서 `NotificationService`를 주입받아 사용합니다:

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationService } from '../integrations/notification';

@Injectable()
export class DocumentService {
    constructor(private readonly notificationService: NotificationService) {}

    async notifyDocumentApproval(documentId: string, approverIds: string[], fcmTokens: string[]) {
        try {
            const result = await this.notificationService.sendNotification({
                sender: 'E2023001',
                title: '결재 요청',
                content: '새로운 문서가 결재를 기다리고 있습니다.',
                recipientIds: approverIds,
                tokens: fcmTokens,
                sourceSystem: 'lias',
                linkUrl: `/documents/${documentId}`,
                metadata: {
                    type: 'approval_request',
                    documentId,
                },
            });

            console.log(`알림 전송 완료: 성공 ${result.successCount}건`);
            return result;
        } catch (error) {
            console.error('알림 전송 실패:', error);
            throw error;
        }
    }

    // Authorization 헤더를 포함하여 전송
    async notifyWithAuth(documentId: string, approverIds: string[], fcmTokens: string[], authToken: string) {
        const result = await this.notificationService.sendNotification(
            {
                sender: 'E2023001',
                title: '결재 요청',
                content: '새로운 문서가 결재를 기다리고 있습니다.',
                recipientIds: approverIds,
                tokens: fcmTokens,
                sourceSystem: 'lias',
                linkUrl: `/documents/${documentId}`,
            },
            authToken, // Authorization 헤더 전달
        );

        return result;
    }
}
```

### 2. 간편 메서드 사용

```typescript
// 여러 명에게 알림 전송
const result = await this.notificationService.sendToMultiple(
    'E2023001', // 발신자
    '결재 요청', // 제목
    '새로운 문서가 등록되었습니다.', // 내용
    ['E2023002', 'E2023003'], // 수신자 ID 목록
    ['fcm_token_1', 'fcm_token_2'], // FCM 토큰 목록
    {
        sourceSystem: 'lias',
        linkUrl: '/documents/123',
        metadata: {
            type: 'document_created',
            priority: 'high',
        },
        authorization: 'Bearer your-token-here', // Authorization 헤더 (선택)
    },
);
```

### 3. SSO와 함께 사용 (FCM 토큰 조회)

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationService } from '../integrations/notification';
import { SSOService } from '../integrations/sso';

@Injectable()
export class ApprovalService {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly ssoService: SSOService,
    ) {}

    async notifyApprovers(approverEmployeeNumbers: string[], documentTitle: string) {
        try {
            // 1. SSO에서 FCM 토큰 조회
            const tokenResponse = await this.ssoService.getMultipleFcmTokens({
                employeeNumbers: approverEmployeeNumbers,
            });

            // 2. 직원별 FCM 토큰 추출
            const recipientIds: string[] = [];
            const tokens: string[] = [];

            tokenResponse.byEmployee.forEach((emp) => {
                if (emp.tokens.length > 0) {
                    // 각 직원의 첫 번째 토큰 사용 (또는 모든 토큰 사용 가능)
                    recipientIds.push(emp.employeeNumber);
                    tokens.push(emp.tokens[0].fcmToken);
                }
            });

            // 3. 알림 전송
            if (recipientIds.length > 0) {
                const result = await this.notificationService.sendToMultiple(
                    'SYSTEM',
                    '결재 요청',
                    `${documentTitle} 문서가 결재를 기다리고 있습니다.`,
                    recipientIds,
                    tokens,
                    {
                        sourceSystem: 'lias',
                        linkUrl: '/approval/pending',
                        metadata: {
                            type: 'approval_request',
                        },
                    },
                );

                console.log(`알림 전송: ${result.successCount}명 성공, ${result.failureCount}명 실패`);
                return result;
            }
        } catch (error) {
            console.error('결재자 알림 전송 실패:', error);
            throw error;
        }
    }
}
```

## API 명세

### sendNotification(dto, authorization?)

```typescript
async sendNotification(
    dto: SendNotificationDto,
    authorization?: string  // Authorization 헤더 (선택)
): Promise<SendNotificationResponseDto>
```

### SendNotificationDto (요청)

| 필드           | 타입     | 필수 | 설명                                           |
| -------------- | -------- | ---- | ---------------------------------------------- |
| `sender`       | string   | ✅   | 발신자 ID (사번)                               |
| `title`        | string   | ✅   | 알림 제목                                      |
| `content`      | string   | ✅   | 알림 내용                                      |
| `recipientIds` | string[] | ✅   | 수신자 사용자 ID 목록 (사번), 최대 500개       |
| `tokens`       | string[] | ✅   | 수신자 FCM 토큰 목록, recipientIds와 순서 일치 |
| `sourceSystem` | string   | ❌   | 소스 시스템 (기본값: "portal")                 |
| `linkUrl`      | string   | ❌   | 알림 클릭 시 이동할 URL                        |
| `metadata`     | object   | ❌   | 추가 메타데이터 (JSON)                         |

**추가 파라미터:**

- `authorization` (string, 선택): API 서버로 전달할 Authorization 헤더

### SendNotificationResponseDto (응답)

```typescript
{
  success: boolean;           // 성공 여부
  message: string;            // 응답 메시지
  notificationIds: string[];  // 생성된 알림 ID 목록
  successCount: number;       // 성공 건수
  failureCount: number;       // 실패 건수
}
```

## 에러 처리

```typescript
import { HttpException } from '@nestjs/common';

try {
    const result = await this.notificationService.sendNotification({
        sender: 'E2023001',
        title: '알림',
        content: '내용',
        recipientIds: ['E2023002'],
        tokens: ['invalid_token'],
    });
} catch (error) {
    if (error instanceof HttpException) {
        console.error('HTTP 에러:', error.getStatus(), error.message);
    } else {
        console.error('기타 에러:', error);
    }
}
```

## 제한사항

1. **최대 전송 개수**

    - 한 번에 최대 **500개**의 알림까지 전송 가능

2. **배열 길이 일치**

    - `recipientIds`와 `tokens` 배열의 길이는 반드시 일치해야 함

3. **최소 수신자**

    - 최소 1명 이상의 수신자가 필요함

4. **타임아웃**
    - 기본 타임아웃: 30초
    - 대량 전송 시 응답 시간 고려 필요

## 주요 기능

- ✅ **FCM 푸시 알림 전송**: 포털 알림 서버를 통한 알림 전송
- ✅ **유효성 검증**: 요청 데이터 자동 검증
- ✅ **에러 핸들링**: HTTP 에러 및 네트워크 에러 처리
- ✅ **로깅**: 요청/응답 자동 로깅
- ✅ **간편 메서드**: sendToMultiple() 제공
- ✅ **타임아웃 제어**: 30초 기본 타임아웃

## 참고

- 포털 알림 서비스 API 문서: `src/modules/integrations/API_DOCUMENTATION.md`
- SSO 모듈 (FCM 토큰 조회): `src/modules/integrations/sso/README.md`
