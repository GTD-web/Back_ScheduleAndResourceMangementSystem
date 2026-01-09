# 데이터 스냅샷 (Data Snapshot) API

월간 요약 데이터를 스냅샷으로 저장하고 조회하는 API입니다.

## 📋 개요

월간 근태 요약 데이터를 특정 시점에 스냅샷으로 저장하여, 나중에 결재 승인이나 대시보드 조회에 활용할 수 있습니다.

## 🏗 아키텍처

```
Controller (Business Layer)
    ↓
Service (Business Layer)
    ↓
Context (Context Layer)
    ↓
Domain Services (Domain Layer)
    ↓
Repositories (Domain Layer)
    ↓
Database
```

## 📊 데이터 구조

### DataSnapshotInfo (부모)
- `dataSnapshotId`: 스냅샷 고유 ID
- `snapshotName`: 스냅샷 이름
- `description`: 스냅샷 설명
- `snapshotType`: 스냅샷 타입 (DAILY, WEEKLY, MONTHLY, ANNUAL_LEAVE)
- `yyyy`: 연도
- `mm`: 월
- `dataSnapshotChildInfoList`: 자식 데이터 리스트

### DataSnapshotChild (자식)
- `dataSnapshotChildId`: 자식 고유 ID
- `employeeId`: 직원 ID
- `employeeName`: 직원 이름
- `employeeNumber`: 사원 번호
- `yyyy`: 연도
- `mm`: 월
- `snapshotData`: MonthlyEventSummary JSON 데이터

## 🔌 API 엔드포인트

### 1. 스냅샷 생성
```http
POST /api/data-snapshot
Content-Type: application/json

{
  "snapshotName": "2024년 11월 근태 스냅샷",
  "description": "2024년 11월 전 직원 근태 요약",
  "snapshotType": "MONTHLY",
  "yyyy": "2024",
  "mm": "11",
  "monthlySummaries": [
    {
      "monthlyEventSummaryId": "uuid",
      "employeeNumber": "24004",
      "employeeId": "uuid",
      "employeeName": "홍길동",
      "yyyymm": "2024-11",
      ...
    }
  ]
}
```

### 2. 모든 스냅샷 조회
```http
GET /api/data-snapshot
GET /api/data-snapshot?yyyy=2024
GET /api/data-snapshot?yyyy=2024&mm=11
GET /api/data-snapshot?snapshotType=MONTHLY
GET /api/data-snapshot?yyyy=2024&mm=11&snapshotType=MONTHLY
```

### 3. 특정 스냅샷 조회
```http
GET /api/data-snapshot/{dataSnapshotId}
```

### 4. 스냅샷 수정 (이름, 설명만)
```http
PUT /api/data-snapshot/{dataSnapshotId}
Content-Type: application/json

{
  "snapshotName": "2024년 11월 근태 스냅샷 (최종)",
  "snapshotDescription": "승인 완료된 스냅샷"
}
```

### 5. 스냅샷 삭제
```http
DELETE /api/data-snapshot/{dataSnapshotId}
```

## 💡 사용 시나리오

### 시나리오 1: 월간 근태 확정
1. 프론트엔드에서 월간 요약 데이터 조회
2. 관리자가 확인 후 "스냅샷 저장" 버튼 클릭
3. `POST /api/data-snapshot`으로 스냅샷 생성
4. 생성된 스냅샷 ID로 결재 상신

### 시나리오 2: 결재 승인 후 조회
1. 결재 승인 완료
2. `GET /api/data-snapshot/{dataSnapshotId}`로 스냅샷 조회
3. 대시보드에 승인된 스냅샷 데이터 표시

### 시나리오 3: 월별 히스토리 조회
1. `GET /api/data-snapshot?yyyy=2024`로 2024년 전체 스냅샷 조회
2. 월별 변화 추이 분석

## 🔐 보안 고려사항

- **권한 체크**: 스냅샷 생성/수정/삭제는 관리자만 가능하도록 Guard 추가 필요
- **데이터 검증**: DTO validation으로 잘못된 데이터 차단
- **트랜잭션**: 스냅샷 생성 시 트랜잭션으로 데이터 일관성 보장

## 📝 참고사항

### Cascade 설정
- DataSnapshotInfo 삭제 시 DataSnapshotChild도 자동 삭제 (onDelete: CASCADE)
- DataSnapshotInfo 저장 시 DataSnapshotChild도 자동 저장 (cascade: ['insert', 'update', 'remove'])

### JSON 데이터 저장
- `DataSnapshotChild.snapshotData`는 `MonthlyEventSummary`를 JSON.stringify()로 저장
- 조회 시 `@AfterLoad()`로 자동으로 JSON.parse() 수행

### 성능 최적화
- 대량 데이터 저장 시 트랜잭션 사용
- children relations을 필요한 경우에만 로드

## 🚀 향후 개선사항

1. **버전 관리**: 같은 연월의 스냅샷 버전 관리 기능
2. **비교 기능**: 스냅샷 간 데이터 비교 API
3. **통계**: 스냅샷 통계 정보 제공
4. **엑셀 내보내기**: 스냅샷 데이터를 엑셀로 내보내기

