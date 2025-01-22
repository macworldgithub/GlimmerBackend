// @ts-nocheck
import { PartialType } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateProducItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  product_sub_category: string;
}

export class UpdateProductItemDto extends PartialType(
  CreateProducItemDto,
) {}
