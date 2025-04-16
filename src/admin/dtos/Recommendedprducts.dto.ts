// dto/recommended-products.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class RecommendedProductItemDto {
  @ApiProperty({
    example: '6790dc0061ee32e4f9038adf',
    description: 'Unique product identifier for the recommended product',
  })
  productId!: string;

  @ApiProperty({
    example: '67d918bc4bf2d4af93416da8',
    description: 'Reference id, typically the same as salonId',
  })
  ref!: string;

  @ApiProperty({
    example: 0,
    description: 'Number of units sold for the product',
  })
  soldUnits!: number;

  @ApiProperty({
    example: 0,
    description: 'Number of units returned for the product',
  })
  returnedUnits!: number;
}

export class RecommendedProductsDto {
  @ApiProperty({
    example: '67fe4143637f68cb669b3495',
    description: 'Unique identifier of the recommended products record',
  })
  _id!: string;

  @ApiProperty({
    example: 56,
    description: 'Rating (or rate) of the salon',
  })
  rate!: number;

  @ApiProperty({
    example: '67d918bc4bf2d4af93416da8',
    description: 'Unique identifier of the salon',
  })
  salonId!: string;

  @ApiProperty({
    type: [RecommendedProductItemDto],
    description: 'List of recommended products for the salon',
    example: [
      {
        productId: '6790dc0061ee32e4f9038adf',
        ref: '67d918bc4bf2d4af93416da8',
        soldUnits: 0,
        returnedUnits: 0,
      },
      {
        productId: '679745e2d9fa7ab0a8a9a760',
        ref: '67d918bc4bf2d4af93416da8',
        soldUnits: 0,
        returnedUnits: 0,
      },
    ],
  })
  productList!: RecommendedProductItemDto[];

  @ApiProperty({
    example: 7,
    description: 'Version key of the document',
  })
  __v!: number;
}
