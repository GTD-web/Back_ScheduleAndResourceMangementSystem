# 리팩토링 폴더

이 폴더는 프로젝트 구조 문서에 따라 CQRS 패턴을 적용한 리팩토링된 코드를 포함합니다.

## 목적

- 원본 소스 코드는 그대로 유지
- 리팩토링된 코드를 별도 폴더에 생성하여 점진적 마이그레이션
- 문서화된 아키텍처 패턴 적용

## 구조

```
refactoring/
└── context/
    └── attendance-data-context/  # 첫 번째 리팩토링 대상
        ├── attendance-data-context.module.ts
        ├── attendance-data-context.service.ts
        ├── handlers/
        │   └── attendance-data/
        │       └── commands/
        └── interfaces/
            ├── command/
            └── response/
```

## 리팩토링 단계

### ✅ 1단계: CQRS 패턴 도입 (완료)

- [x] CqrsModule 추가
- [x] attendance-data-context 리팩토링
- [x] Command Handler 생성
- [x] Context Service 생성
- [x] Context Module 생성

### 🔄 2단계: Interface 레이어 분리 (예정)

- [ ] `interface/` 폴더 구조 생성
- [ ] Controller 이동
- [ ] Business Service에서 Context Service 호출로 변경

### 🔄 3단계: 나머지 Context 리팩토링 (예정)

- [ ] 각 Context를 CQRS 패턴으로 전환
- [ ] 네이밍 컨벤션 통일
- [ ] 큰 파일 분리

### 🔄 4단계: Domain Service 강화 (예정)

- [ ] Domain Service에 한글 메서드 추가
- [ ] Entity 불변성 검증 추가
- [ ] Repository 패턴 정리

## 사용 방법

리팩토링된 모듈을 사용하려면 `app.module.ts`에서 import하세요:

```typescript
import { AttendanceDataContextModule } from './refactoring/context/attendance-data-context';

@Module({
  imports: [
    // 기존 모듈
    // AttendanceDataModule,  // 원본 (주석 처리)
    
    // 리팩토링된 모듈
    AttendanceDataContextModule,
  ],
})
export class AppModule {}
```

## 참고 문서

- [PROJECT_STRUCTURE.md](../../docs/PROJECT_STRUCTURE.md)
- [NAMING_CONVENTIONS.md](../../docs/NAMING_CONVENTIONS.md)
- [FILE_PATTERNS.md](../../docs/FILE_PATTERNS.md)
- [CONTEXT_COMMANDBUS_PATTERNS.md](../../docs/CONTEXT_COMMANDBUS_PATTERNS.md)

