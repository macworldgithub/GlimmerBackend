// src/order/dto/payment-status-param.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PaymentStatusParamDto {
  @ApiProperty({
    example: 'CX-12345678901',
    description: 'PostEx tracking number to check payment status',
  })
  @IsString()
  trackingNumber!: string;
}
