export * from './department';
export * from './employee';

import { QUERY_HANDLERS as DEPARTMENT_QUERY_HANDLERS } from './department';
import { QUERY_HANDLERS as EMPLOYEE_QUERY_HANDLERS } from './employee';

export const QUERY_HANDLERS = [...DEPARTMENT_QUERY_HANDLERS, ...EMPLOYEE_QUERY_HANDLERS];
