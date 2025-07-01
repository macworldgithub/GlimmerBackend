// @ts-nocheck

import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import PaymentMethod from 'src/order/enums/payment_method.enum';
import { Order } from 'src/schemas/ecommerce/order.schema';

export class OrderReqDto {
  @IsArray() // Ensures it's an array
  @ValidateNested({ each: true }) // Validates each item in the array
  @Type(() => OrderItemDto) // Specifies the type for transformation
  order_items: OrderItemDto[];

  // req-dto-decorators
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;
}

class OrderItemDto {
  @IsInt()
  @Min(1)
  @Max(5)
  quantity: number;

  // req-dto-decorators
  @IsMongoId()
  product: Types.ObjectId;
}

class TempOrderClass extends PickType(Order, [
  'status',
  'order_items',
] as const) {}
export class UpdateOrderDto extends PartialType(TempOrderClass) {}

export class updateConfirmedOrderStatusDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Order status',
    enum: ['In Process', 'Delivered', 'Returned', 'Cancelled'],
  })
  @IsEnum(['In Process', 'Delivered', 'Returned', 'Cancelled'])
  orderStatus: string;
 }