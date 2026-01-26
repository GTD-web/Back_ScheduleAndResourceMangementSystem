# Attendance Data Context - 리팩토링 버전

## 개요

이 폴더는 `attendance-data-context`의 CQRS 패턴을 적용한 리팩토링 버전입니다.

## 구조

```
attendance-data-context/
├── attendance-data-context.module.ts    # Context Module (CqrsModule 포함)
├── attendance-data-context.service.ts   # Context Service (CommandBus/QueryBus 사용)
├── handlers/
│   └── attendance-data/
│       └── commands/
│           ├── upload-event-history.handler.ts
│           ├── upload-attendance-data.handler.ts
│           ├── regenerate-daily-summaries.handler.ts
│           └── index.ts
└── interfaces/
    ├── command/
    │   ├── upload-event-history-command.interface.ts
    │   ├── upload-attendance-data-command.interface.ts
    │   └── regenerate-daily-summaries-command.interface.ts
    └── response/
        ├── upload-event-history-response.interface.ts
        ├── upload-attendance-data-response.interface.ts
        └── regenerate-daily-summaries-response.interface.ts
```

## 주요 변경사항

### 1. CQRS 패턴 도입

- **기존**: Context 클래스가 직접 Domain Service를 호출
- **변경**: Command/Query Handler를 통해 비즈니스 로직 처리

### 2. Handler 분리

기존의 큰 Context 파일 (893줄)을 다음과 같이 분리:

- `UploadEventHistoryHandler`: 출입 이벤트 업로드 처리
- `UploadAttendanceDataHandler`: 근태 데이터 업로드 처리
- `RegenerateDailySummariesHandler`: 일일 요약 재생성 처리

### 3. 트랜잭션 관리 통일

모든 Handler에서 `DataSource.transaction`을 사용하여 트랜잭션을 일관되게 관리합니다.

### 4. Context Service 생성

`AttendanceDataContextService`가 CommandBus를 통해 Handler를 호출하는 역할을 담당합니다.

## 사용 방법

### 1. Module 등록

```typescript
import { AttendanceDataContextModule } from './refactoring/context/attendance-data-context';

@Module({
    imports: [
        AttendanceDataContextModule,
        // ...
    ],
})
export class AppModule {}
```

### 2. Service 사용

```typescript
import { AttendanceDataContextService } from './refactoring/context/attendance-data-context';

@Injectable()
export class SomeService {
    constructor(private readonly attendanceDataContextService: AttendanceDataContextService) {}

    async someMethod() {
        // 출입 이벤트 업로드
        const result = await this.attendanceDataContextService.출입이벤트를업로드한다(file, uploadBy, generateSummary);
    }
}
```

### 3. Command 직접 사용

```typescript
import { CommandBus } from '@nestjs/cqrs';
import { UploadEventHistoryCommand } from './refactoring/context/attendance-data-context';

@Injectable()
export class SomeService {
    constructor(private readonly commandBus: CommandBus) {}

    async someMethod() {
        const command = new UploadEventHistoryCommand({
            file,
            uploadBy,
            generateSummary: false,
        });
        const result = await this.commandBus.execute(command);
    }
}
```

## Handler 목록

### Command Handlers

1. **UploadEventHistoryHandler**
    - 출입 이벤트 엑셀 파일 업로드 및 처리
    - 파일 업로드 → 엑셀 읽기 → 데이터 가공 → 저장

2. **UploadAttendanceDataHandler**
    - 근태 데이터 엑셀 파일 업로드 및 처리
    - 파일 업로드 → 엑셀 읽기 → 데이터 가공 → 저장

3. **RegenerateDailySummariesHandler**
    - 특정 연월의 일일 요약 재생성
    - 출입 이벤트 조회 → 근태 사용 내역 조회 → 일일 요약 생성

## 다음 단계

1. Query Handler 추가 (조회 기능)
2. Domain Service 강화 (비즈니스 로직 이동)
3. 테스트 코드 작성
4. 원본 코드와 병행 테스트
