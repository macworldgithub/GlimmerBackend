// src/mail/dto/order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDto } from './order_item_dtos';

export class OrderDto {
  @ApiProperty({ example: '123456', description: 'Order identifier' })
  id!: string;

  @ApiProperty({ example: 'May 8, 2025', description: 'Order date' })
  date!: string;

  @ApiProperty({ type: [OrderItemDto], description: 'List of items in the order' })
  items!: OrderItemDto[];

  @ApiProperty({ example: 90.0, description: 'Order subtotal' })
  subtotal!: number;

  @ApiProperty({ example: 5.0, description: 'Shipping cost' })
  shipping!: number;

  @ApiProperty({ example: 95.0, description: 'Order total' })
  total!: number;
}
