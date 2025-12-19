import { Module } from '@nestjs/common';
import { ResourceManagerController } from './controllers/resource-manager.controller';
import { EmployeeController } from './controllers/employee.controller';
import { UserController } from './controllers/user.controller';
import { EmployeeManagementService } from './employee-management.service';
import { EmployeeContextModule } from '../../context/employee/employee.context.module';
import { EmployeeWebhookController } from './controllers/webhook.controller';
import { DepartmentController } from './controllers/department.controller';

@Module({
    imports: [EmployeeContextModule],
    controllers: [
        ResourceManagerController,
        EmployeeController,
        UserController,
        EmployeeWebhookController,
        DepartmentController,
    ],
    providers: [EmployeeManagementService],
    exports: [EmployeeManagementService],
})
export class EmployeeManagementModule {}
