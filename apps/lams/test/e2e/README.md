# E2E 테스트 구조

이 폴더는 LAMS 애플리케이션의 E2E 테스트를 관리합니다.

## 폴더 구조

```
test/e2e/
├── utils/                    # 공통 테스트 유틸리티
│   ├── test-setup.ts        # 테스트 애플리케이션 설정
│   └── test-helpers.ts      # 테스트 헬퍼 함수들
├── attendance-data/          # 출입/근태 데이터 컨트롤러 테스트
│   └── attendance-data.e2e-spec.ts
├── attendance-issue/         # 근태 이슈 컨트롤러 테스트
│   └── attendance-issue.e2e-spec.ts
├── file-management/          # 파일 관리 컨트롤러 테스트
│   └── file-management.e2e-spec.ts
├── organization-management/  # 조직 관리 컨트롤러 테스트
│   └── organization-management.e2e-spec.ts
├── settings/                 # 설정 관리 컨트롤러 테스트
│   └── settings.e2e-spec.ts
└── scenarios/                # 시나리오 테스트 (향후 작성)
```

## 테스트 실행

```bash
# 모든 E2E 테스트 실행
npm run test:e2e

# 특정 컨트롤러 테스트만 실행
npm run test:e2e -- attendance-data
```

## 공통 유틸리티

### TestSetup
- `createTestApp()`: 테스트 애플리케이션 생성
- `closeTestApp()`: 테스트 애플리케이션 종료

### TestHelpers
- `createMockToken()`: 모킹된 인증 토큰 생성
- `createAuthHeaders()`: 인증 헤더 생성
- `get()`, `post()`, `patch()`, `delete()`: HTTP 요청 헬퍼
- `uploadFile()`: 파일 업로드 요청 헬퍼

### TestDataBuilder
- `getEmployee()`: 직원 조회 (없으면 null)
- `getDepartment()`: 부서 조회 (없으면 null)
- `getAttendanceTypeByTitle()`: 근태 유형 조회 (제목으로)
- `getAnnualLeaveType()`: '연차' 근태 유형 조회
- `getDailySummary()`: 일간 요약 조회
- `getSnapshot()`: 스냅샷 조회
- `getAttendanceIssue()`: 근태 이슈 조회
- `getFile()`: 파일 조회
- `getHoliday()`: 휴일 정보 조회
- `getWorkTimeOverride()`: 특별근태시간 조회
- `createTestDailySummary()`: 테스트용 일간 요약 생성
- `ensureAttendanceType()`: 근태 유형이 없으면 생성

## 실제 데이터베이스 사용

E2E 테스트는 실제 데이터베이스에 연결되어 실행됩니다. 따라서:

1. **하드코딩된 UUID 사용 금지**: 테스트에서 하드코딩된 UUID를 사용하면 실제 DB에 해당 데이터가 없어 테스트가 실패합니다.

2. **TestDataBuilder 사용**: `TestDataBuilder`를 사용하여 실제 DB에서 데이터를 조회하거나 생성합니다.

3. **데이터가 없을 때**: 테스트에서 필요한 데이터가 없으면 `console.warn()`으로 경고를 출력하고 테스트를 스킵합니다.

4. **초기 데이터 준비**: 
   - `InitService`가 애플리케이션 시작 시 근태 유형, 휴일 정보를 자동 생성합니다.
   - `OrganizationMigrationService`가 SSO에서 조직 데이터를 마이그레이션합니다.
   - 테스트 실행 전에 이러한 초기화가 완료되어 있어야 합니다.

## 테스트 작성 가이드

```typescript
describe('SomeController (e2e)', () => {
    let app: INestApplication;
    let testData: TestDataBuilder;
    let testEmployeeId: string | null = null;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        testData = new TestDataBuilder(app);
        
        // 실제 데이터 조회
        const employee = await testData.getEmployee();
        testEmployeeId = employee?.id || null;
    });

    it('테스트 케이스', () => {
        // 데이터가 없으면 스킵
        if (!testEmployeeId) {
            console.warn('직원 데이터가 없어 테스트를 스킵합니다.');
            return;
        }

        // 실제 ID 사용
        return request(app.getHttpServer())
            .get(`/api/employees/${testEmployeeId}`)
            .expect(200);
    });
});
```

## 시나리오 테스트

향후 여러 API를 연계하여 테스트하는 시나리오 테스트는 `scenarios/` 폴더에 작성할 수 있습니다.

예시:
- 파일 업로드 → 파일 내용 반영 → 월간 요약 조회
- 근태 이슈 생성 → 사유 작성 → 수정 정보 설정 → 반영
