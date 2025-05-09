// src/mail/dto/customer.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CustomerDto {
  @ApiProperty({ example: 'Anas Rashid', description: 'Customer full name' })
  name!: string;
}
