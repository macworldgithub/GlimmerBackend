// @ts-nocheck
import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateProductCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProductCategoryDto extends PartialType(
  CreateProductCategoryDto,
) {}
