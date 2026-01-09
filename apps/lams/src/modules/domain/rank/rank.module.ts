import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainRankService } from './rank.service';
import { DomainRankRepository } from './rank.repository';
import { Rank } from './rank.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Rank])],
    providers: [DomainRankService, DomainRankRepository],
    exports: [DomainRankService],
})
export class DomainRankModule {}
