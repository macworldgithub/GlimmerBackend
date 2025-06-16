// src/order/dto/operational-city-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class OperationalCityQueryDto {
  @ApiPropertyOptional({
    enum: ['Pickup', 'Delivery'],
    description: 'Filter city type',
  })
  @IsOptional()
  @IsIn(['Pickup', 'Delivery'])
  operationalCityType?: string;
}
