import { Module } from '@nestjs/common';
import { OrganizationManagementBusinessService } from './organization-management-business.service';
import { OrganizationManagementContextModule } from '../../context/organization-management-context/organization-management-context.module';

/**
 * 조직 관리 비즈니스 Module
 */
@Module({
    imports: [OrganizationManagementContextModule],
    providers: [OrganizationManagementBusinessService],
    exports: [OrganizationManagementBusinessService],
})
export class OrganizationManagementBusinessModule {}
