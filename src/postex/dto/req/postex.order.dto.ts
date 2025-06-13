import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// src/order/dto/create-order.dto.ts
export class PostexOrderDto {
  @ApiProperty({
    example: '665cba3456abcde123456789',
    description: 'MongoDB Order ID',
  })
  @IsString()
  orderId!: string;
}
