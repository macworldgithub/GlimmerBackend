// dto/recommended-products.dto.ts (continued)
import { ApiProperty } from '@nestjs/swagger';


export class Delete_recommended_products_dto_response {
  @ApiProperty({
    example: '67fe4143637f68cb669b3495',
    description: 'Unique identifier of the recommended products record',
  })
  _id!: string;

  @ApiProperty({
    example: 56,
    description: 'Rating of the salon',
  })
  rate!: number;

  @ApiProperty({
    example: '67d918bc4bf2d4af93416da8',
    description: 'Unique identifier of the salon',
  })
  salonId!: string;

  @ApiProperty({
   
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
  productList!: any[];

  @ApiProperty({
    example: 7,
    description: 'Version key of the document',
  })
  __v!: number;
}
