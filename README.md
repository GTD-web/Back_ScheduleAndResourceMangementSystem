# 백엔드 리소스 관리 시스템

NestJS 기반의 통합 자원 및 일정 관리 시스템입니다.

## 📋 프로젝트 개요

회사 내 다양한 자원(차량, 회의실, 숙소, 장비 등)의 예약 및 일정 관리를 통합하여 제공하는 백엔드 시스템입니다.

### 주요 기능

- **자원 관리**: 차량, 회의실, 숙소, 장비 등 다양한 유형의 자원 관리
- **예약 관리**: 자원 예약 생성, 수정, 취소 및 일정 관리
- **일정 관리**: 개인/부서 일정, 프로젝트 일정, 자원 예약 일정 통합 관리
- **알림 시스템**: FCM 기반 푸시 알림 및 예약/일정 관련 자동 알림
- **직원 관리**: 부서별 직원 관리 및 권한 제어
- **통계**: 자원 사용률, 예약 통계, 차량 정비 내역 등 다양한 통계 제공

## 🏗️ 아키텍처

### 계층 구조

```
src/
├── business/       # 비즈니스 로직 계층
├── context/        # 컨텍스트 계층 (비즈니스와 도메인 간 중간 계층)
├── domain/         # 도메인 계층 (데이터 접근 및 도메인 로직)
└── main.ts

libs/
├── entities/       # TypeORM 엔티티
├── decorators/     # 커스텀 데코레이터
├── guards/         # 인증/인가 가드
├── filters/        # 예외 필터
└── configs/        # 설정 파일
```

### Business Layer (비즈니스 로직)

| 모듈                        | 설명                                             |
| --------------------------- | ------------------------------------------------ |
| **auth-management**         | JWT 기반 인증, SSO 연동                          |
| **employee-management**     | 직원 정보 관리, 부서 관리, 자원 관리자 관리      |
| **resource-management**     | 자원(차량, 회의실, 숙소, 장비) CRUD 및 그룹 관리 |
| **reservation-management**  | 자원 예약 생성/수정/취소, 차량 반납 처리         |
| **schedule-management**     | 일정 생성/조회/수정, 일정 연장, 캘린더 조회      |
| **notification-management** | 알림 발송, FCM 구독 관리, 자동 알림 스케줄링     |
| **file-management**         | 파일 업로드/다운로드 (S3 연동)                   |
| **statistics**              | 자원 사용 통계, 예약 통계, 차량 정비 통계        |
| **task-management**         | 업무 관리 (예정)                                 |

### Context Layer (컨텍스트 계층)

비즈니스 로직과 도메인 간의 복잡한 로직을 처리하는 중간 계층입니다.

- **employee**: 직원 목록 조회, 부서별 그룹핑, 자원 관리자 조회
- **resource**: 자원별 상세 정보 조회 및 검증 로직
- **reservation**: 예약 생성/수정 시 유효성 검증 및 비즈니스 규칙 적용
- **schedule**: 일정 조회/생성/수정, 일정 상태 전이, 권한 검증
- **notification**: 예약/일정/자원별 알림 발송 로직
- **file**: S3 파일 업로드/다운로드 어댑터

### Domain Layer (도메인 계층)

TypeORM Repository 패턴을 사용한 데이터 접근 계층입니다.

**주요 도메인:**

- Employee, Department, DepartmentEmployee
- Resource, ResourceGroup, ResourceManager
- VehicleInfo, MeetingRoomInfo, AccommodationInfo, EquipmentInfo
- Reservation, ReservationParticipant, ReservationVehicle, ReservationSnapshot
- Schedule, ScheduleParticipant, ScheduleDepartment, ScheduleRelation
- Notification, NotificationType, EmployeeNotification
- Consumable, Maintenance
- File, FileResource, FileVehicleInfo, FileMaintenance
- RequestLog

## 🔧 기술 스택

- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT
- **File Storage**: AWS S3
- **Push Notification**: Firebase Cloud Messaging (FCM)
- **Cron Jobs**: @nestjs/schedule
- **Documentation**: Swagger (OpenAPI)

## 🚀 실행 방법

### Docker 실행

```bash
docker-compose -f docker-compose.yml up -d --build --force-recreate
docker compose push resource-server
```

### API 문서

개발 서버 API 문서: http://192.168.10.168:5001/api-docs
