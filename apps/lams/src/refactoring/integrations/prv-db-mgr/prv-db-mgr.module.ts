import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './typeorm.config';
import { EntityList } from './entities';
import { PrvDbMgrService } from './prv-db-mgr.service';
import { PrvDbMgrController } from './prv-db-mgr.controller';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            name: 'prv',
            useFactory: () => ({
                ...getTypeOrmConfig(),
                name: 'prv',
                autoLoadEntities: false,
                entities: Object.values(EntityList),
                synchronize: false,
            }),
        }),
    ],
    controllers: [PrvDbMgrController],
    providers: [PrvDbMgrService],
    exports: [PrvDbMgrService],
})
export class PrvDbMgrModule {}
