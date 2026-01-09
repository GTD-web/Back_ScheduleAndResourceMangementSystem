import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainPositionService } from './position.service';
import { DomainPositionRepository } from './position.repository';
import { Position } from './position.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Position])],
    providers: [DomainPositionService, DomainPositionRepository],
    exports: [DomainPositionService, DomainPositionRepository],
})
export class DomainPositionModule {}
