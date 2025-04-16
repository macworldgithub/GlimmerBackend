// dto/add-recommended-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AddRecommendedProductDto {
  @ApiProperty({
    example: '67975d70c5661506b69dc45a',
    description: 'Unique product identifier to be added to the recommended list',
  })
  productId!: string;
}
