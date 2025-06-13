// src/order/dto/track-order-param.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TrackOrderParamDto {
  @ApiProperty({
    example: 'CX-12345678901',
    description: 'Tracking number provided by PostEx',
  })
  @IsString()
  trackingNumber!: string;
}
