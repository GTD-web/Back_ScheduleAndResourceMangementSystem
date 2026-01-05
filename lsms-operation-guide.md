# LSMS 시스템 운영관리 문서

## 1. 시스템 개요

### 1.1 시스템 목적

본 시스템은 조직의 리소스(차량, 회의실, 숙소, 장비 등) 예약 및 관리, 일정 관리, 알림 발송 등을 통합 관리하기 위한 백엔드 서버 시스템입니다.

### 1.2 시스템 특징

- **모노리식 아키텍처**: 단일 서비스로 구성된 통합 관리 시스템
- **계층형 아키텍처**: Domain-Context-Business 3계층 구조 (MDC 패턴)
- **서버리스 배포**: Vercel을 활용한 클라우드 배포
- **SSO 연동**: 외부 SSO 시스템과의 통합 인증
- **실시간 알림**: Firebase Cloud Messaging 및 Web Push를 통한 푸시 알림
- **자동 크론 작업**: Vercel Cron을 통한 스케줄 작업 자동화

---

## 2. 서버 구성

### 2.1 서비스 구성

#### 2.1.1 Resource Management Server

- **배포 플랫폼**: Vercel (서버리스)
- **역할**: 리소스 관리 시스템의 핵심 서버
- **주요 기능**:
    - 리소스 예약 및 관리
    - 일정 관리
    - 직원 관리
    - 파일 관리
    - 알림 발송
    - 통계 및 대시보드
- **API 엔드포인트**: `/api/*` 프리픽스로 모든 요청 처리

### 2.2 주요 비즈니스 모듈

#### 2.2.1 인증 관리 (Auth Management)

- **기능**:
    - SSO 로그인 연동
    - JWT 토큰 발급 및 검증
    - 시스템 관리자 인증
    - 직원 정보 동기화

#### 2.2.2 직원 관리 (Employee Management)

- **기능**:
    - 직원 정보 관리
    - 부서 관리
    - 권한 관리 (역할 변경)
    - 비밀번호 변경
    - 알림 설정 관리
    - Webhook 연동

#### 2.2.3 리소스 관리 (Resource Management)

- **기능**:
    - 리소스 및 리소스 그룹 관리
    - 차량 정보 관리
    - 회의실 정보 관리
    - 숙소 정보 관리
    - 장비 정보 관리
    - 소모품 관리
    - 정비 이력 관리

#### 2.2.4 예약 관리 (Reservation Management)

- **기능**:
    - 리소스 예약 생성/수정/취소
    - 차량 예약 관리
    - 예약 승인/거부
    - 예약 스냅샷 관리
    - 크론 작업을 통한 예약 상태 자동 업데이트

#### 2.2.5 일정 관리 (Schedule Management)

- **기능**:
    - 일정 생성/수정/삭제
    - 일정 참가자 관리
    - 부서 일정 관리
    - 일정 관계 관리

#### 2.2.6 파일 관리 (File Management)

- **기능**:
    - 파일 업로드/다운로드/삭제
    - 다중 파일 처리
    - S3 Presigned URL 생성
    - 크론 작업을 통한 임시 파일 정리

#### 2.2.7 알림 관리 (Notification Management)

- **기능**:
    - 푸시 알림 발송 (Firebase, Web Push)
    - 이메일 알림 발송 (Gmail SMTP)
    - 알림 구독 관리
    - 알림 타입 관리
    - 크론 작업을 통한 예약 시작 알림

#### 2.2.8 통계 (Statistics)

- **기능**:
    - 리소스 사용 통계
    - 직원 예약 통계
    - 소모품 및 정비 통계
    - 차량 정비 이력 통계

#### 2.2.9 작업 관리 (Task Management)

- **기능**:
    - 작업 목록 조회
    - 작업 상태 관리

---

## 3. 기술 스택

### 3.1 프레임워크 및 언어

- **프레임워크**: NestJS 10.x
- **언어**: TypeScript 5.8.3
- **런타임**: Node.js 18 (Alpine)
- **패키지 매니저**: npm (pnpm 지원)

### 3.2 데이터베이스

- **PostgreSQL**: 메인 데이터베이스
    - Supabase 클라우드 사용 (프로덕션)
    - 리소스 데이터, 직원 정보, 예약 정보, 일정 정보 등 저장
    - TypeORM을 통한 ORM 관리

### 3.3 캐시 및 메시징

- **Redis**:
    - 캐시 저장소
    - BullMQ Job Queue 백엔드 (필요시)
- **NATS** (외부 네트워크):
    - 마이크로서비스 간 메시지 브로커 (선택적 사용)
    - 이벤트 기반 통신

### 3.4 스토리지 및 외부 서비스

- **Supabase Storage (S3 호환)**:
    - 파일 저장소
    - Presigned URL 지원
- **Firebase Cloud Messaging**:
    - 푸시 알림 발송
    - 모바일 및 웹 푸시 지원
- **Web Push**:
    - 브라우저 푸시 알림
    - PWA 지원

### 3.5 주요 라이브러리

```json
{
    "프레임워크": ["@nestjs/core", "@nestjs/common", "@nestjs/cqrs"],
    "데이터베이스": ["typeorm", "@nestjs/typeorm", "pg"],
    "인증": ["@nestjs/jwt", "passport-jwt", "bcryptjs", "@lumir-company/sso-sdk"],
    "파일처리": ["multer", "@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],
    "알림": ["firebase-admin", "web-push", "@nestjs-modules/mailer"],
    "일정": ["@nestjs/schedule", "cron", "dayjs"],
    "기타": ["axios", "exceljs", "class-validator", "class-transformer"]
}
```

---

## 4. 인프라 구성

### 4.1 Vercel 배포 구성

#### 4.1.1 배포 플랫폼

- **플랫폼**: Vercel (서버리스)
- **런타임**: Node.js 18.x
- **빌드 도구**: Vercel Build System
- **배포 방식**: Git 연동 자동 배포 또는 Vercel CLI 수동 배포

#### 4.1.2 Vercel 설정 파일 (vercel.json)

```json
{
    "version": 2,
    "env": {
        "NODE_ENV": "production"
    },
    "builds": [
        {
            "src": "api/index.ts",
            "use": "@vercel/node",
            "config": {
                "includeFiles": ["libs/**", "src/**", "public/**", "tsconfig.json"]
            }
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "api/index.ts",
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
        }
    ],
    "crons": [
        {
            "path": "/api/v1/notifications/cron-job/send-upcoming-notification",
            "schedule": "* * * * 1-5"
        },
        {
            "path": "/api/v1/reservations/cron-job/close",
            "schedule": "1 * * * *"
        },
        {
            "path": "/api/v1/reservations/cron-job/start-odometer",
            "schedule": "0 * * * *"
        },
        {
            "path": "/api/v2/schedule/cron-job/post-processing",
            "schedule": "0 * * * *"
        },
        {
            "path": "/api/v1/files/cron-job/delete-temporary-file",
            "schedule": "0 0 * * *"
        },
        {
            "path": "/api/v1/employees/sync",
            "schedule": "0 0 * * *"
        }
    ]
}
```

#### 4.1.3 API 엔트리 포인트

- **파일 위치**: `api/index.ts`
- **역할**: Vercel 서버리스 함수로 NestJS 애플리케이션 래핑
- **특징**: 
    - 앱 인스턴스 캐싱으로 콜드 스타트 최소화
    - 모든 HTTP 메서드 지원
    - 자동 스케일링

### 4.2 외부 서비스 의존성

- **PostgreSQL**: Supabase 클라우드 (SSL 연결)
- **파일 저장소**: Supabase Storage (S3 호환)
- **Redis**: 외부 Redis 서비스 (필요시, 선택적)
- **NATS**: 외부 NATS 서비스 (필요시, 선택적)

### 4.3 ~~Docker 구성 (Deprecated)~~

> **참고**: 이전에는 Docker를 사용한 배포 방식을 사용했으나, 현재는 Vercel 서버리스 배포로 전환되었습니다. Docker 관련 설정은 개발 환경에서만 참고용으로 유지됩니다.

#### ~~4.3.1 컨테이너 구성 (Deprecated)~~

~~이전 Docker 배포 구성은 더 이상 사용되지 않습니다.~~

- ~~애플리케이션 컨테이너: `resource-server`~~
- ~~인프라 컨테이너: Redis (선택적)~~

#### ~~4.3.2 네트워크 구성 (Deprecated)~~

~~Docker 네트워크 구성은 더 이상 사용되지 않습니다.~~

---

## 5. 환경 변수 설정

### 5.1 공통 환경 변수

| 변수명    | 설명              | 기본값         |
| --------- | ----------------- | -------------- |
| NODE_ENV  | 실행 환경         | production     |
| TZ        | 타임존            | Asia/Seoul     |
| APP_NAME  | 애플리케이션 이름 | resource-service |
| APP_PORT  | 애플리케이션 포트 | (Vercel에서 자동 관리) |

### 5.2 데이터베이스 환경 변수

```bash
# PostgreSQL (Supabase)
POSTGRES_HOST=aws-0-ap-northeast-2.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_DB=postgres
POSTGRES_USER=postgres.sdjojmvjvzszrdekyrnv
POSTGRES_PASSWORD=[비밀번호]
POSTGRES_SCHEMA=public
```

### 5.3 Redis 환경 변수 (선택적)

```bash
# 외부 Redis 서비스 사용 시
REDIS_HOST=[외부 Redis 호스트]
REDIS_PORT=6379
```

**참고**: Vercel 환경에서는 Redis가 필수가 아닙니다. 캐싱이 필요한 경우 외부 Redis 서비스를 사용하거나 Vercel의 Edge Config를 활용할 수 있습니다.

### 5.4 JWT 인증 환경 변수

```bash
GLOBAL_SECRET=13hjkabsud23l13asbizx
JWT_EXPIRES_IN=24h
```

### 5.5 이메일 환경 변수

```bash
GMAIL_USER=noti.lumir.space@gmail.com
GMAIL_APP_PASSWORD=zlwmvrkqhhmrjmno
```

### 5.6 S3/Supabase Storage 환경 변수

```bash
S3_ACCESS_KEY=[액세스 키]
S3_SECRET_KEY=[시크릿 키]
S3_BUCKET_NAME=rms
S3_REGION=ap-northeast-2
S3_ENDPOINT=https://sdjojmvjvzszrdekyrnv.supabase.co/storage/v1/s3
```

### 5.7 Firebase 환경 변수

```bash
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=lumir-notification
FIREBASE_PRIVATE_KEY_ID=[프라이빗 키 ID]
FIREBASE_PRIVATE_KEY=[프라이빗 키]
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@lumir-notification.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=[클라이언트 ID]
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
```

### 5.8 Web Push 환경 변수

```bash
WEB_PUSH_PUBLIC_KEY=[퍼블릭 키]
WEB_PUSH_PRIVATE_KEY=[프라이빗 키]
```

### 5.9 외부 서비스 통신 환경 변수

```bash
NATS_URL=nats://nats:4222
```

---

## 6. 빌드 및 배포 프로세스

### 6.1 개발 환경

#### 6.1.1 사전 준비

```bash
# 1. 의존성 설치
npm install
# 또는
pnpm install
```

#### 6.1.2 개발 서버 실행

```bash
# 개발 서버 실행 (watch 모드)
npm run start:dev

# 디버그 모드 실행
npm run start:debug

# 프로덕션 모드 실행 (로컬 테스트)
npm run start:prod
```

### 6.2 프로덕션 배포 (Vercel)

#### 6.2.1 Vercel CLI를 통한 배포

```bash
# 1. Vercel CLI 설치 (전역)
npm install -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 연결
vercel link

# 4. 환경 변수 설정
vercel env add [환경변수명]

# 5. 프로덕션 배포
vercel --prod
```

#### 6.2.2 Git 연동 자동 배포

1. **Vercel 대시보드에서 프로젝트 연결**
   - GitHub/GitLab/Bitbucket 레포지토리 연결
   - 브랜치별 자동 배포 설정

2. **환경 변수 설정**
   - Vercel 대시보드 → Settings → Environment Variables
   - 프로덕션, 프리뷰, 개발 환경별로 설정 가능

3. **자동 배포 트리거**
   - `main` 브랜치 푸시 → 프로덕션 배포
   - Pull Request → 프리뷰 배포

#### 6.2.3 빌드 설정

Vercel은 자동으로 다음을 수행합니다:
- TypeScript 컴파일
- 의존성 설치 (`npm install` 또는 `pnpm install`)
- `api/index.ts`를 서버리스 함수로 빌드
- 정적 파일 처리

**빌드 명령어 커스터마이징** (필요시):
- Vercel 대시보드 → Settings → General → Build & Development Settings

#### 6.2.4 배포 확인

```bash
# 배포 상태 확인
vercel ls

# 배포 로그 확인
vercel logs [deployment-url]

# 특정 배포 상세 정보
vercel inspect [deployment-url]
```

### 6.3 ~~Docker 배포 (Deprecated)~~

> **참고**: Docker 배포 방식은 더 이상 사용되지 않습니다. 개발 환경에서만 참고용으로 유지됩니다.

~~#### 6.3.1 Dockerfile 빌드 프로세스 (Deprecated)~~

~~이전 Docker 배포 구성은 더 이상 사용되지 않습니다.~~

~~#### 6.3.2 이미지 레지스트리 (Deprecated)~~

~~Docker 이미지 레지스트리는 더 이상 사용되지 않습니다.~~

---

## 7. 데이터베이스 관리

### 7.1 PostgreSQL 설정

#### 7.1.1 기본 설정

- **서비스**: Supabase (클라우드)
- **호스트**: `aws-0-ap-northeast-2.pooler.supabase.com`
- **포트**: 6543
- **데이터베이스명**: postgres
- **스키마**: public
- **SSL**: 활성화 (필수)

#### 7.1.2 마이그레이션 관리

TypeORM 마이그레이션을 사용하여 데이터베이스 스키마를 관리합니다.

```bash
# 마이그레이션 생성
npm run migration:create -- [마이그레이션명]

# 마이그레이션 생성 (엔티티 변경사항 기반)
npm run migration:generate -- -n [마이그레이션명]

# 마이그레이션 실행
npm run migration:run

# 마이그레이션 롤백
npm run migration:revert
```

**참고**: 프로덕션 환경에서는 `migrationsRun: true` 설정으로 자동 마이그레이션이 실행됩니다.

#### 7.1.3 백업 전략

Supabase는 자동 백업을 제공하지만, 수동 백업이 필요한 경우:

```bash
# 로컬에서 백업 생성
pg_dump -h aws-0-ap-northeast-2.pooler.supabase.com \
        -p 6543 \
        -U postgres.sdjojmvjvzszrdekyrnv \
        -d postgres \
        --schema=public \
        --no-owner \
        --no-privileges \
        -f backup_$(date +%Y%m%d_%H%M).sql
```

**복원**

```bash
# 백업 파일 복원
psql -h aws-0-ap-northeast-2.pooler.supabase.com \
     -p 6543 \
     -U postgres.sdjojmvjvzszrdekyrnv \
     -d postgres \
     -f backup_20250105_1200.sql
```

### 7.2 Redis 설정

#### 7.2.1 기본 설정

- **버전**: latest
- **포트**: 6379
- **영속성**: AOF (Append Only File) 활성화 권장
    ```bash
    redis-server --appendonly yes
    ```

#### 7.2.2 사용 용도

- 캐시 저장소
- BullMQ Job Queue 백엔드 (필요시)
- 세션 데이터 저장 (필요시)

---

## 8. 코드 품질 및 개발 규칙

### 8.1 아키텍처 패턴

#### 8.1.1 MDC (Model-Domain-Context) 패턴

- **Domain Layer**: 엔티티 및 기본 CRUD 작업
- **Context Layer**: 비즈니스 로직 조합 및 복합 워크플로우
- **Business Layer**: API 엔드포인트 및 컨트롤러

#### 8.1.2 의존성 규칙

- Business Layer → Context Layer → Domain Layer
- 상위 레이어는 하위 레이어만 의존
- 레이어 간 역방향 의존성 금지

### 8.2 ESLint 설정

```javascript
// .eslintrc.js
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-console": "off",
    "@typescript-eslint/no-explicit-any": "off"
  }
}
```

### 8.3 Prettier 설정

```json
{
    "bracketSpacing": true,
    "singleQuote": true,
    "semi": true,
    "useTabs": false,
    "tabWidth": 4,
    "trailingComma": "all",
    "printWidth": 120
}
```

### 8.4 TypeScript 설정

- **타겟**: ES2021
- **모듈 시스템**: CommonJS
- **데코레이터**: 활성화 (NestJS 필수)
- **소스맵**: 활성화
- **경로 별칭**:
    ```json
    {
        "@libs/*": "./libs/*",
        "@resource/*": "./src/*"
    }
    ```

---

## 9. 모니터링 및 로깅

### 9.1 로그 관리

#### 9.1.1 Vercel 로그 확인

```bash
# Vercel CLI를 통한 로그 확인
vercel logs [deployment-url]

# 실시간 로그 스트리밍
vercel logs --follow

# 특정 함수 로그만 확인
vercel logs --function api/index.ts
```

**Vercel 대시보드에서 확인**:
- Vercel 대시보드 → 프로젝트 → Deployments → 특정 배포 → Functions 탭
- 실시간 로그 스트리밍 및 검색 기능 제공

#### 9.1.2 로그 레벨

- 개발 환경: `development` (디버그 로그 포함)
- 프로덕션: `production` (주요 로그만)
- Vercel 환경: 자동으로 프로덕션 모드로 실행

### 9.2 헬스 체크

Vercel 배포 환경에서 상태 확인:

```bash
# 서버 상태 확인
curl https://[your-vercel-domain]/api

# Swagger 문서 확인
curl https://[your-vercel-domain]/api-docs

# Vercel 배포 상태 확인
vercel inspect [deployment-url]
```

**Vercel 대시보드에서 확인**:
- 프로젝트 → Deployments에서 배포 상태 확인
- Functions 탭에서 함수 실행 상태 확인

### 9.3 데이터베이스 모니터링

```bash
# PostgreSQL 연결 확인
psql -h aws-0-ap-northeast-2.pooler.supabase.com \
     -p 6543 \
     -U postgres.sdjojmvjvzszrdekyrnv \
     -d postgres \
     -c "SELECT version();"
```

**Supabase 대시보드에서 확인**:
- Supabase 대시보드 → Database → Connection Pooling에서 연결 상태 확인
- Logs 탭에서 쿼리 로그 확인

### 9.4 Swagger API 문서

- **프로덕션**: `https://[your-vercel-domain]/api-docs`
- **프리뷰 배포**: 각 Pull Request마다 자동 생성되는 프리뷰 URL에서 확인 가능

---

## 10. 보안 설정

### 10.1 JWT 토큰 관리

- **Secret Key**: 환경 변수로 관리 (`GLOBAL_SECRET`)
- **만료 시간**: 24시간
- **알고리즘**: HS256 (기본값)
- **SSO 연동**: `@lumir-company/sso-sdk` 사용

### 10.2 데이터베이스 보안

- Supabase SSL 연결 필수
- 강력한 비밀번호 사용
- 환경 변수로 민감 정보 관리

### 10.3 CORS 설정

프로덕션 환경에서는 허용된 도메인만 접근 가능:

```typescript
const whitelist = [
    'https://portal.lumir.space',
    'https://lsms.lumir.space',
    'https://lrms.lumir.space',
    // ... 기타 허용 도메인
];
```

### 10.4 환경 변수 관리

- `.env` 파일은 `.gitignore`에 포함
- **Vercel 환경 변수 설정**:
    - Vercel 대시보드 → Settings → Environment Variables
    - 프로덕션, 프리뷰, 개발 환경별로 분리 관리
    - 암호화되어 안전하게 저장
- 민감한 정보는 절대 코드에 하드코딩하지 않음
- Vercel CLI를 통한 환경 변수 관리:
    ```bash
    # 환경 변수 추가
    vercel env add [변수명]
    
    # 환경 변수 목록 확인
    vercel env ls
    
    # 환경 변수 삭제
    vercel env rm [변수명]
    ```

### 10.5 Vercel 보안 설정

- **HTTPS**: 모든 요청 자동 HTTPS 적용
- **CORS**: 애플리케이션 코드에서 설정한 허용 도메인만 접근 가능
- **Rate Limiting**: Vercel Pro 플랜 이상에서 제공
- **DDoS Protection**: Vercel이 자동으로 제공

---

## 11. 트러블슈팅

### 11.1 일반적인 문제

#### 문제 1: 배포 실패

```bash
# 배포 로그 확인
vercel logs [deployment-url]

# 빌드 로그 확인 (Vercel 대시보드)
# 프로젝트 → Deployments → 실패한 배포 → Build Logs

# 로컬에서 빌드 테스트
npm run build

# Vercel 로컬 개발 서버로 테스트
vercel dev
```

**일반적인 원인**:
- 환경 변수 누락
- 의존성 설치 실패
- TypeScript 컴파일 오류
- 빌드 타임아웃

#### 문제 2: 데이터베이스 연결 실패

```bash
# 연결 정보 확인
echo $POSTGRES_HOST
echo $POSTGRES_PORT

# 연결 테스트
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB
```

#### 문제 3: 마이그레이션 오류

```bash
# 마이그레이션 상태 확인
npm run typeorm -- migration:show

# 마이그레이션 롤백
npm run migration:revert

# 수동으로 마이그레이션 실행
npm run migration:run
```

#### 문제 4: 파일 업로드 실패

```bash
# S3 설정 확인 (Vercel 환경 변수)
# Vercel 대시보드 → Settings → Environment Variables

# 권한 확인
# Supabase Storage 대시보드에서 버킷 권한 확인
```

#### 문제 5: 크론 작업 실행 실패

```bash
# 크론 작업 로그 확인
# Vercel 대시보드 → 프로젝트 → Cron Jobs

# 수동 실행 테스트
curl -X GET https://[your-vercel-domain]/api/v1/reservations/cron-job/close
```

**일반적인 원인**:
- 크론 작업 경로 오류
- 환경 변수 누락
- 타임아웃 (Vercel 무료 플랜: 10초, Pro: 60초)

### 11.2 데이터 초기화

```bash
# 주의: 데이터 손실 발생
# 모든 마이그레이션 롤백
npm run migration:revert

# 또는 데이터베이스 스키마 재생성 (개발 환경만)
# Supabase 대시보드에서 직접 삭제 후 마이그레이션 재실행
```

### 11.3 ~~Docker 관련 문제 (Deprecated)~~

> **참고**: Docker 관련 문제 해결은 더 이상 적용되지 않습니다.

---

## 12. API 문서

### 12.1 Swagger 문서

- **개발 서버**: `http://192.168.10.168:5001/api-docs`
- **프로덕션**: 환경에 따라 다름
- Swagger UI를 통한 인터랙티브 API 문서 제공

### 12.2 주요 API 엔드포인트

#### 인증

- POST `/api/auth/login` - SSO 로그인
- POST `/api/auth/refresh` - 토큰 갱신

#### 직원 관리

- GET `/api/employee` - 직원 목록 조회
- GET `/api/employee/:id` - 직원 상세 조회
- POST `/api/employee` - 직원 생성
- PATCH `/api/employee/:id` - 직원 정보 수정
- GET `/api/department` - 부서 목록 조회

#### 리소스 관리

- GET `/api/resource` - 리소스 목록 조회
- GET `/api/resource/:id` - 리소스 상세 조회
- POST `/api/resource` - 리소스 생성
- PATCH `/api/resource/:id` - 리소스 수정
- DELETE `/api/resource/:id` - 리소스 삭제

#### 예약 관리

- GET `/api/reservation` - 예약 목록 조회
- GET `/api/reservation/:id` - 예약 상세 조회
- POST `/api/reservation` - 예약 생성
- PATCH `/api/reservation/:id` - 예약 수정
- DELETE `/api/reservation/:id` - 예약 취소

#### 일정 관리

- GET `/api/schedule` - 일정 목록 조회
- POST `/api/schedule` - 일정 생성
- PATCH `/api/schedule/:id` - 일정 수정
- DELETE `/api/schedule/:id` - 일정 삭제

#### 파일 관리

- POST `/api/file/upload` - 파일 업로드
- GET `/api/file/:id` - 파일 다운로드
- DELETE `/api/file/:id` - 파일 삭제
- GET `/api/file/presigned-url` - Presigned URL 생성

#### 알림 관리

- GET `/api/notification` - 알림 목록 조회
- POST `/api/notification/subscribe` - 알림 구독
- DELETE `/api/notification/subscribe` - 알림 구독 해제

---

## 13. 크론 작업

Vercel Cron을 통한 자동화된 스케줄 작업입니다. `vercel.json` 파일에서 설정됩니다.

### 13.1 알림 발송 (예정 알림)

- **스케줄**: 매주 월~금요일 매 분 (`* * * * 1-5`)
- **엔드포인트**: `GET /api/v1/notifications/cron-job/send-upcoming-notification`
- **기능**: 곧 시작할 예약/일정에 대한 알림 발송

### 13.2 예약 종료 처리

- **스케줄**: 매 시간 1분, 31분 (`1 * * * *`, `31 * * * *`)
- **엔드포인트**: `GET /api/v1/reservations/cron-job/close`
- **기능**: 종료 시간이 지난 예약의 상태를 자동으로 업데이트

### 13.3 차량 주행거리 시작 처리

- **스케줄**: 매 시간 정각, 30분 (`0 * * * *`, `30 * * * *`)
- **엔드포인트**: `GET /api/v1/reservations/cron-job/start-odometer`
- **기능**: 예약 시작 시 차량 주행거리 자동 기록

### 13.4 일정 후처리

- **스케줄**: 매 시간 정각, 30분 (`0 * * * *`, `30 * * * *`)
- **엔드포인트**: `GET /api/v2/schedule/cron-job/post-processing`
- **기능**: 일정 종료 후 자동 처리 작업 수행

### 13.5 임시 파일 정리

- **스케줄**: 매일 자정 (00:00) (`0 0 * * *`)
- **엔드포인트**: `GET /api/v1/files/cron-job/delete-temporary-file`
- **기능**: 일정 기간이 지난 임시 파일 자동 삭제

### 13.6 직원 정보 동기화

- **스케줄**: 매일 자정 (00:00) (`0 0 * * *`)
- **엔드포인트**: `GET /api/v1/employees/sync`
- **기능**: 외부 SSO 시스템과 직원 정보 동기화

### 13.7 크론 작업 모니터링

**Vercel 대시보드에서 확인**:
- 프로젝트 → Settings → Cron Jobs
- 실행 이력 및 상태 확인
- 실패한 작업 로그 확인

**Vercel CLI로 확인**:
```bash
# 크론 작업 목록 확인
vercel cron ls

# 특정 크론 작업 상세 정보
vercel cron inspect [cron-id]
```

---

## 14. 유지보수 체크리스트

### 14.1 일일 체크

- [ ] Vercel 배포 상태 확인 (대시보드)
- [ ] 로그에 에러 없는지 확인 (Vercel Functions 로그)
- [ ] 데이터베이스 연결 상태 확인 (Supabase)
- [ ] 크론 작업 실행 상태 확인 (Vercel Cron Jobs)

### 14.2 주간 체크

- [ ] 데이터베이스 백업 확인 (Supabase 자동 백업)
- [ ] Vercel 배포 이력 리뷰
- [ ] 보안 업데이트 확인
- [ ] 의존성 취약점 확인 (`npm audit`)
- [ ] Vercel 사용량 모니터링 (대역폭, 함수 실행 횟수)

### 14.3 월간 체크

- [ ] 의존성 업데이트 검토
- [ ] 성능 모니터링 리뷰 (Vercel Analytics)
- [ ] 백업 복원 테스트 (Supabase)
- [ ] API 문서 업데이트
- [ ] 환경 변수 정리 및 검토

---

## 15. 연락처 및 지원

### 15.1 개발팀 정보

- **프로젝트명**: LSMS (Lumir Space Management System)
- **레포지토리**: Monorepo 구조
- **문의**: 시스템 관리자에게 문의

### 15.2 외부 서비스 의존성

- **PostgreSQL**: Supabase 클라우드
- **파일 저장소**: Supabase Storage (S3 호환)
- **푸시 알림**: Firebase Cloud Messaging
- **이메일**: Gmail SMTP
- **SSO**: Lumir SSO SDK

---

## 부록 A: 배포 정보

### A.1 Vercel 배포 URL

| 환경     | URL 형식                                    | 설명           |
| -------- | ------------------------------------------- | -------------- |
| 프로덕션 | `https://[project-name].vercel.app`         | 메인 배포      |
| 프리뷰   | `https://[project-name]-[hash].vercel.app`  | PR별 프리뷰     |
| 개발     | `https://[project-name]-[branch].vercel.app` | 브랜치별 배포  |

### A.2 API 엔드포인트

- **기본 경로**: `/api/*`
- **Swagger 문서**: `/api-docs`
- **정적 파일**: `/static/*`

### A.3 ~~포트 매핑 (Deprecated)~~

> **참고**: Vercel 서버리스 환경에서는 포트 매핑이 필요하지 않습니다. 모든 요청은 HTTPS를 통해 자동 라우팅됩니다.

~~이전 Docker 배포 시 포트 매핑 정보는 더 이상 사용되지 않습니다.~~

---

## 부록 B: 서비스 의존성 다이어그램

```
[외부 요청]
    ↓
[Vercel Edge Network]
    ↓
[Serverless Function (api/index.ts)]
    ↓
[NestJS Application] ← JWT 인증
    ↓
    ├─→ [PostgreSQL (Supabase)]
    │       └─→ SSL 연결
    │
    ├─→ [Supabase Storage (S3)]
    │       └─→ 파일 저장소
    │
    ├─→ [Firebase Cloud Messaging]
    │       └─→ 푸시 알림
    │
    ├─→ [Gmail SMTP]
    │       └─→ 이메일 알림
    │
    ├─→ [SSO Service]
    │       └─→ 인증 연동
    │
    ├─→ [Redis] (선택적, 외부 서비스)
    │       └─→ 캐시 및 Job Queue
    │
    └─→ [NATS] (선택적, 외부 서비스)
            └─→ 메시지 브로커

[Vercel Cron Jobs]
    ↓
    ├─→ 알림 발송 크론
    ├─→ 예약 상태 업데이트 크론
    ├─→ 일정 후처리 크론
    ├─→ 임시 파일 정리 크론
    └─→ 직원 동기화 크론
```

---

## 부록 C: 주요 엔티티 목록

- **Employee**: 직원 정보
- **Department**: 부서 정보
- **Resource**: 리소스 정보
- **ResourceGroup**: 리소스 그룹
- **Reservation**: 예약 정보
- **ReservationVehicle**: 차량 예약
- **Schedule**: 일정 정보
- **File**: 파일 정보
- **Notification**: 알림 정보
- **VehicleInfo**: 차량 정보
- **MeetingRoomInfo**: 회의실 정보
- **AccommodationInfo**: 숙소 정보
- **EquipmentInfo**: 장비 정보
- **Consumable**: 소모품 정보
- **Maintenance**: 정비 이력

---

**문서 버전**: 1.1  
**최종 수정일**: 2026년 1월 5일  
**작성자**: 시스템 관리자  
**변경 이력**: 
- v1.1: Docker 배포에서 Vercel 서버리스 배포로 전환

