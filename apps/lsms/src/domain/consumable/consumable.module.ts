import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainConsumableService } from './consumable.service';
import { DomainConsumableRepository } from './consumable.repository';
import { Consumable } from './consumable.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Consumable])],
    providers: [DomainConsumableService, DomainConsumableRepository],
    exports: [DomainConsumableService],
})
export class DomainConsumableModule {}
