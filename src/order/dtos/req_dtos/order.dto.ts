// @ts-nocheck

import { PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsMongoId,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { Order } from 'src/schemas/ecommerce/order.schema';

export class OrderReqDto {
  @IsArray() // Ensures it's an array
  @ValidateNested({ each: true }) // Validates each item in the array
  @Type(() => OrderItemDto) // Specifies the type for transformation
  order_items: OrderItemDto[];
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
