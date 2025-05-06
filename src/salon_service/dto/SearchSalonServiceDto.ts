// src/salon-services/dto/search-salon-service.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchSalonServiceDto {

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  serviceTerm?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  nameTerm?: string;
}
