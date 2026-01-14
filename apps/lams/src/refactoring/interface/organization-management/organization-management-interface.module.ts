import { Module } from '@nestjs/common';
import { OrganizationManagementController } from './organization-management.controller';
import { OrganizationManagementBusinessModule } from '../../business/organization-management-business/organization-management-business.module';

/**
 * 조직 관리 Interface Module
 */
@Module({
    imports: [OrganizationManagementBusinessModule],
    controllers: [OrganizationManagementController],
})
export class OrganizationManagementInterfaceModule {}
