// src/order/dto/operational-city-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class OperationalCityQueryDto {
  @ApiPropertyOptional({
    enum: ['pickup', 'delivery'],
    description: 'Filter city type',
  })
  @IsOptional()
  @IsIn(['pickup', 'delivery'])
  operationalCityType?: string;
}
