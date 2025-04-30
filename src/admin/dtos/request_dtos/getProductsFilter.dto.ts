// src/products/dto/get-products-filter.dto.ts
import { IsOptional, IsArray, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetProductsFilterDto {
  /**
   * Pass a comma-separated list of flags:
   *   ?filter=best_seller
   *   ?filter=best_seller,trending_product
   * If omitted, all three categories are returned.
   */
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  @IsArray()
  @IsIn(['best_seller', 'trending_product', 'you_must_have_this'], {
    each: true,
  })
  filter?: string[];
}
