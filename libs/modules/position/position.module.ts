import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainPositionService } from './position.service';
import { Position } from './position.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Position])],
    providers: [DomainPositionService],
    exports: [DomainPositionService],
})
export class DomainPositionModule {}
