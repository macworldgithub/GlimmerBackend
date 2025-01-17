// @ts-nocheck
import { PartialType } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateProductSubCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  product_category: string;
}

export class UpdateProductSubCategoryDto extends PartialType(
  CreateProductSubCategoryDto,
) {}
