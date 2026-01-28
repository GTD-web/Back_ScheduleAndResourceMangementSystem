import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WageCalculationType } from './wage-calculation-type.entity';
import { DomainWageCalculationTypeService } from './wage-calculation-type.service';

/**
 * 임금 계산 유형 모듈
 *
 * 전사적으로 적용되는 통상임금제/포괄임금제 상태를 기간별로 관리하는 도메인 모듈입니다.
 */
@Module({
    imports: [TypeOrmModule.forFeature([WageCalculationType])],
    providers: [DomainWageCalculationTypeService],
    exports: [DomainWageCalculationTypeService, TypeOrmModule],
})
export class DomainWageCalculationTypeModule {}
