import { Module } from '@nestjs/common';
import { DepartmentContext } from './department.context';
import { DomainDepartmentModule } from '../../domain/department/department.module';

@Module({
    imports: [DomainDepartmentModule],
    providers: [DepartmentContext],
    exports: [DepartmentContext],
})
export class DepartmentContextModule {}

