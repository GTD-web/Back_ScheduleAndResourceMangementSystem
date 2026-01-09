# Libs 공유 라이브러리

이 폴더는 프로젝트 전체에서 공유되는 라이브러리 코드를 포함합니다.

## 구조

```
libs/
├── configs/              # 설정 파일 (DB, JWT 등)
├── database/             # 데이터베이스 모듈 (공유)
├── guards/               # 인증/인가 가드
├── interceptors/         # 인터셉터
├── decorators/           # 데코레이터
├── entities/             # 공유 엔티티 (lsms용)
├── modules/              # 공유 도메인 모듈 (lsms용)
├── migrations/           # 마이그레이션 파일
├── services/             # 공유 서비스
├── repositories/         # 공유 리포지토리
├── interfaces/           # 공유 인터페이스
├── dtos/                 # 공유 DTO
├── enums/                # 공유 열거형
├── constants/            # 상수
├── utils/                # 유틸리티
├── swagger/              # Swagger 설정
└── strategies/           # 인증 전략
```

## 사용 현황

### LAMS 프로젝트
- `@libs/database` - 데이터베이스 모듈만 사용
- 자체 domain 모듈 사용 (`apps/lams/src/modules/domain/`)

### LSMS 프로젝트 (현재 비활성화)
- `@libs/database` - 데이터베이스 모듈
- `@libs/modules` - 공유 도메인 모듈 (employee, department 등)
- `@libs/entities` - 공유 엔티티
- 기타 공유 라이브러리들

## 정리 계획

### 기존 코드 (유지)
- `libs/database/` - LAMS와 LSMS 모두에서 사용
- `libs/configs/` - 공유 설정
- `libs/guards/`, `libs/interceptors/` 등 - 공유 미들웨어
- `libs/modules/` - LSMS 전용 (현재 비활성화)
- `libs/entities/` - LSMS 전용 (현재 비활성화)

### 새로 적용할 코드 (리팩토링용)
- 리팩토링된 코드는 `apps/lams/src/refactoring/` 폴더에 위치
- libs는 기존 구조 유지

## 주의사항

- LAMS는 자체 domain 모듈을 사용하므로 `libs/modules`를 사용하지 않음
- LSMS는 현재 실행에서 제외됨 (`nest-cli.json`에서 `_lsms_disabled`로 변경)

