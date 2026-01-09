import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainRankService } from './rank.service';
import { Rank } from './rank.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Rank])],
    providers: [DomainRankService],
    exports: [DomainRankService],
})
export class DomainRankModule {}
