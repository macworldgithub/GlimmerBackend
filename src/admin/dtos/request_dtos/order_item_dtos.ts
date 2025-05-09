// src/mail/dto/order-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 'prod-A-001', description: 'Unique product identifier' })
  productId!: string;

  @ApiProperty({ example: 'store-100', description: 'Unique store identifier' })
  storeId!: string;

  @ApiProperty({ example: 'Main Street Shop', description: 'Name of the store' })
  storeName!: string;

  @ApiProperty({ example: 'Product A', description: 'Product name' })
  name!: string;

  @ApiProperty({ example: 'https://…/prod-a.jpg', description: 'URL of product image' })
  image!: string;

  @ApiProperty({ example: 2, description: 'Quantity ordered' })
  quantity!: number;

  @ApiProperty({ example: 25.00, description: 'Unit price' })
  price!: number;
}
