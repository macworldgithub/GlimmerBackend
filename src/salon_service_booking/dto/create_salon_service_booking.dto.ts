// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsDate,
  ValidateNested,
} from 'class-validator';

export class PaymentDto {
  @ApiProperty({ example: 'TXN-123456' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ example: 'Stripe' })
  @IsString()
  @IsOptional()
  gateway?: string;

  @ApiProperty({ example: 'Success', enum: ['Success', 'Failed', 'Pending'] })
  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateSalonServiceBookingDto {
  @ApiProperty({ description: 'Customer full name', example: 'John Doe' })
  @IsString()
  customerName: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john@example.com',
  })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+1 234 567 890',
  })
  @IsString()
  customerPhone: string;

  @ApiProperty({
    description: 'Service Mongo Db Id',
    example: 'asnlasid8a7sd8asn',
  })
  @IsString()
  serviceId: string;

  @ApiProperty({ description: 'Final price after discount', example: 45 })
  @IsNumber()
  @Min(0)
  finalPrice: number;

  @ApiProperty({
    description: 'Booking date and time',
    example: '2025-03-12T15:00:00Z',
  })
  // @IsDate()
  @IsString()
  bookingDate: Date;

  @ApiProperty({ description: 'Booking time', example: '2025-03-12T15:00:00Z' })
  // @IsDate()
  @IsString()
  bookingTime: string;

  @ApiProperty({
    description: 'Payment method',
    enum: ['Prepaid (Card)', 'Pay at Counter'],
  })
  @IsEnum(['Prepaid (Card)', 'Pay at Counter'])
  paymentMethod: string;

  @ApiProperty({
    description: 'Optional customer notes',
    example: 'Please be on time.',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: PaymentDto, required: false })
  @ValidateNested()
  @Type(() => PaymentDto)
  @IsOptional()
  payment?: PaymentDto;
}
export class UpdateSalonServiceBookingStatusDto {
  @ApiProperty({
    description: 'Service Mongo Db Id',
    example: 'asnlasid8a7sd8asn',
  })
  @IsString()
  bookingId: string;

  @ApiProperty({
    description: 'Booking status',
    enum: ['Completed', 'Completed And Paid', 'Did not show up'],
  })
  @IsEnum(['Completed', 'Completed And Paid', 'Did not show up'])
  bookingStatus: string;
}
