// src/order/dto/update-delivery-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @ApiProperty({
    example: '665cba3456abcde123456789',
    description: 'PostEx registered record _id',
  })
  @IsString()
  id!: string;

  @ApiProperty({
    example: true,
    description: 'Mark as delivered to PostEx or not',
  })
  @IsBoolean()
  deliver_to_postex!: boolean;
}
