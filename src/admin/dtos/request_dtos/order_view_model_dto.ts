// src/mail/dto/order-view-model.dto.ts
import { ApiProperty } from '@nestjs/swagger';

import { CustomerDto } from './customer_dto';
import { OrderDto } from './order_dto';

export class OrderViewModelDto {
  @ApiProperty({ type: CustomerDto, description: 'Information about the customer' })
  customer!: CustomerDto;

  @ApiProperty({ type: OrderDto, description: 'Details of the order' })
  order!: OrderDto;
}
