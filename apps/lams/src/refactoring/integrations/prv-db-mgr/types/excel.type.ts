export type AttendanceRecordType = {
    period: string;
    requestDays: number;
    type: string;
};

export type ExtractEventInfoType = {
    employeeName: string;
    employeeNumber: string;
    status: string;
    eventTime: string;
    yyyymmdd: string;
    hhmmss: string;
};

export type ExtractEmployeeInfoType = {
    department: string;
    name: string;
    employeeNumber: string;
    employeeId?: string;
    entryAt?: string;
    quitedAt?: string;
    attendanceRecords?: AttendanceRecordType[];
    events?: ExtractEventInfoType[];
};

export type ExtractUsedAttendanceDataType = {
    employeeId: string;
    attendanceTypeId: string;
    usedAt: string;
};

export type ExtractExcelDataType = {
    [key: string]: ExtractEmployeeInfoType;
};
