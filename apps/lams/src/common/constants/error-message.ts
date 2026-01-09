const ValidationErrorMessage = {
    REQUIRED: (field: string) => `${field}은(는) 필수 값입니다.`,
    IS_INT: (field: string) => `${field}은(는) 정수여야 합니다.`,
    IS_ARRAY: (field: string) => `${field}은(는) 배열이어야 합니다.`,
    IS_STRING: (field: string) => `${field}은(는) 문자열이어야 합니다.`,
    IS_NUMBER: (field: string) => `${field}은(는) 숫자여야 합니다.`,
    IS_BOOLEAN: (field: string) => `${field}은(는) 불리언이어야 합니다.`,
    IS_DATE: (field: string) => `${field}은(는) 날짜여야 합니다.`,
    IS_EMAIL: (field: string) => `${field}은(는) 이메일 형식이어야 합니다.`,
    IS_URL: (field: string) => `${field}은(는) URL 형식이어야 합니다.`,
    IS_PHONE: (field: string) => `${field}은(는) 전화번호 형식이어야 합니다.`,
    IS_MIN: (field: string, min: number) => `${field}은(는) ${min} 이상이어야 합니다.`,
    IS_MAX: (field: string, max: number) => `${field}은(는) ${max} 이하이어야 합니다.`,
    IS_MIN_LENGTH: (field: string, minLength: number) => `${field}은(는) ${minLength} 글자 이상이어야 합니다.`,
    IS_MAX_LENGTH: (field: string, maxLength: number) => `${field}은(는) ${maxLength} 글자 이하이어야 합니다.`,
    IS_LENGTH: (field: string, minLength: number, maxLength: number) =>
        `${field}은(는) ${minLength} 글자 이상 ${maxLength} 글자 이하이어야 합니다.`,
    IS_REGEX: (field: string, regex: string) => `${field}은(는) ${regex} 형식이어야 합니다.`,
    IS_ENUM: (field: string, enumValues: string[]) => `${field}은(는) ${enumValues.join(', ')} 중 하나여야 합니다.`,
    IS_IN: (field: string, values: string[]) => `${field}은(는) ${values.join(', ')} 중 하나여야 합니다.`,
    IS_NOT_IN: (field: string, values: string[]) => `${field}은(는) ${values.join(', ')} 중 하나여야 합니다.`,
    IS_NOT_NULL: (field: string) => `${field}은(는) NULL이 아니어야 합니다.`,
    IS_NULL: (field: string) => `${field}은(는) NULL이어야 합니다.`,
    IS_POSITIVE: (field: string) => `${field}은(는) 양수여야 합니다.`,
    IS_NEGATIVE: (field: string) => `${field}은(는) 음수여야 합니다.`,
    IS_ZERO: (field: string) => `${field}은(는) 0이어야 합니다.`,
    IS_NOT_ZERO: (field: string) => `${field}은(는) 0이 아니어야 합니다.`,
    INVALID_DATE_FORMAT: (field: string, format: string) =>
        `${field}의 날짜 형식이 올바르지 않습니다. ${format} 형식이어야 합니다.`,
    INVALID_ARRAY_ITEM_TYPE: (field: string, type: string) => `${field}의 모든 항목은 ${type}이어야 합니다.`,
    INVALID_MILEAGE: (field: string) => `${field}은(는) 0 이상 999,999,999 이하의 정수여야 합니다.`,
};

const BusinessErrorMessage = {
    COMMON: {
        NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
        DUPLICATE_USER: '이미 존재하는 사용자입니다.',
        UNAUTHORIZED: '권한이 없습니다.',
    },
    AUTH: {
        USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
        INVALID_PASSWORD: '비밀번호가 일치하지 않습니다.',
        SSO_LOGIN_FAILED: 'SSO 로그인에 실패했습니다.',
    },
    RESOURCE: {
        NOT_FOUND: '요청한 자원을 찾을 수 없습니다.',
        INVALID_STATUS: '잘못된 상태입니다.',
        HAS_RESOURCES: '자원이 포함된 그룹은 삭제할 수 없습니다.',
        IS_AVAILABLE: '사용 가능한 자원은 삭제할 수 없습니다.',
        GROUP_ID_REQUIRED: '자원 그룹 ID는 필수입니다.',
        MANAGERS_REQUIRED: '자원 관리자는 필수입니다.',
        UNSUPPORTED_TYPE: (type: string) => `지원하지 않는 자원 타입입니다: ${type}`,
        FAILED_CREATE: '자원 생성에 실패했습니다.',
        FAILED_UPDATE: '자원 수정에 실패했습니다.',
        FAILED_DELETE: '자원 삭제에 실패했습니다.',
        FAILED_REORDER: '자원 순서 변경에 실패했습니다.',
        DATE_REQUIRED: '시작 날짜와 종료 날짜는 필수입니다.',
        INVALID_DATE_RANGE: '시작 날짜는 종료 날짜보다 이전이어야 합니다.',
        TIME_RANGE_CONFLICT: '시간 범위와 시간 단위는 동시에 선택할 수 없습니다.',
    },
    RESOURCE_GROUP: {
        NOT_FOUND: '요청한 자원 그룹을 찾을 수 없습니다.',
        FAILED_REORDER: '자원 그룹 순서 변경에 실패했습니다.',
    },
    RESOURCE_MANAGER: {
        NOT_FOUND: '요청한 자원 관리자를 찾을 수 없습니다.',
    },
    VEHICLE_INFO: {
        NOT_FOUND: '요청한 차량 정보를 찾을 수 없습니다.',
        FAILED_RETURN: '차량 반납에 실패했습니다.',
    },
    CONSUMABLE: {
        NOT_FOUND: '요청한 소모품 정보를 찾을 수 없습니다.',
        UNAUTHORIZED: '소모품 관리 권한이 없습니다.',
        ALREADY_EXISTS: '이미 존재하는 소모품입니다.',
    },
    MAINTENANCE: {
        NOT_FOUND: '요청한 정비 정보를 찾을 수 없습니다.',
        UNAUTHORIZED: '정비 관리 권한이 없습니다.',
        INVALID_DATE: '직전 정비 이력 보다 이전 날짜에 정비 이력을 등록할 수 없습니다.',
    },
    RESERVATION: {
        NOT_FOUND: '요청한 예약 정보를 찾을 수 없습니다.',
        TIME_CONFLICT: '해당 시간엔 이미 예약이 되어있습니다.',
        INVALID_DATE_RANGE: '시작 시간은 종료 시간보다 이전이어야 합니다.',
        CANNOT_UPDATE_ACCOMMODATION_TIME: '확정된 숙소 예약의 시간은 변경할 수 없습니다.',
        CANNOT_UPDATE_STATUS: (status: string) => `${status} 상태의 예약은 수정할 수 없습니다.`,
        INVALID_RESOURCE_TYPE: '잘못된 자원 타입입니다.',
        CANNOT_RETURN_STATUS: (status: string) => `${status} 상태의 예약은 차량을 반납할 수 없습니다.`,
        VEHICLE_NOT_FOUND: '예약된 차량을 찾을 수 없습니다.',
        VEHICLE_ALREADY_RETURNED: '이미 반납된 차량입니다.',
        INVALID_MILEAGE: '반납 주행거리는 이전 주행거리보다 작을 수 없습니다.',
        RESOURCE_UNAVAILABLE: '예약 가능한 자원이 아닙니다.',
    },
    FILE: {
        NOT_FOUND: '요청한 파일을 찾을 수 없습니다.',
        ID_OR_PATH_REQUIRED: '파일 ID 또는 파일 경로는 필수입니다.',
    },
    EMPLOYEE: {
        NOT_FOUND: '존재하지 않는 사용자입니다.',
        SYNC_FAILED: '직원 정보 동기화에 실패했습니다.',
    },
};

export const ERROR_MESSAGE = {
    VALIDATION: ValidationErrorMessage,
    BUSINESS: BusinessErrorMessage,
};
