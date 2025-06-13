// src/order/dto/cancel-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiProperty({
    example: 'CX-12345678901',
    description: 'PostEx tracking number to cancel',
  })
  @IsString()
  trackingNumber!: string;
}
