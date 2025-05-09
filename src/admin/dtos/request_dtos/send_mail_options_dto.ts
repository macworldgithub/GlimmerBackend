// src/mail/dto/send-mail-options.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { OrderViewModelDto } from './order_view_model_dto';

export class SendMailOptionsDto {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Recipient e-mail address',
  })
  to!: string;

  @ApiProperty({
    type: OrderViewModelDto,
    description: 'View model containing customer and order details',
  })
  viewModel!: OrderViewModelDto;
}
