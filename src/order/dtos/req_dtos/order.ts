import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class TypeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value!: string;
}

class SizeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  unit?: string;
}

export class ProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  _id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  base_price!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  discounted_price!: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image1?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image2?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image3?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty({ type: [TypeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TypeDto)
  type!: TypeDto[];

  @ApiProperty({ type: [SizeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeDto)
  size!: SizeDto[];

  @IsOptional()
  ref_of_salon!: string;

  @IsOptional()
  rate_of_salon!: number;
}

class ShippingInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  zip!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ enum: ['Delivery', 'Pick Up'] })
  @IsEnum(['Delivery', 'Pick Up'])
  @IsNotEmpty()
  shippingMethod!: string;
}

class CompleteOrderDto {
  @ApiProperty({ type: ProductDto })
  @ValidateNested()
  @Type(() => ProductDto)
  product!: ProductDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  total_price!: number;

  @IsOptional()
  ref_of_salon!: string;

  @IsOptional()
  rate_of_salon!: number;
}

export class PaymentDto {
  @ApiPropertyOptional({
    description: 'Transaction reference returned by gateway',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({ enum: ['Success', 'Failed', 'Pending'], default: 'Pending' })
  @IsEnum(['Success', 'Failed', 'Pending'])
  status!: string;

  @ApiProperty({ enum: ['COD', 'Jazzcash', 'Bank'] })
  gateway!: string;

  @ApiPropertyOptional({
    description: 'Amount paid via this method (if partial allowed)',
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Generated bill reference' })
  @IsOptional()
  @IsString()
  reference?: string;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  customerEmail!: string;

  @ApiProperty({ type: [CompleteOrderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompleteOrderDto)
  productList!: CompleteOrderDto[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  total!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  discountedTotal!: number;

  @ApiProperty({ type: PaymentDto })
  @ValidateNested()
  @Type(() => PaymentDto)
  payment!: PaymentDto;

  @ApiProperty({ type: ShippingInfoDto })
  @ValidateNested()
  @Type(() => ShippingInfoDto)
  ShippingInfo!: ShippingInfoDto;
}
export enum OrderProductStatus {
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Pending = 'Pending',
}
export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export class UpdateProductStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  order_id!: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  product_id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  store_id!: string;

  @ApiProperty({ enum: OrderProductStatus })
  @IsEnum(OrderProductStatus, {
    message: 'orderProductStatus must be Accepted, Rejected, or Pending',
  })
  @IsNotEmpty()
  order_product_status!: string;
}
export class UpdateOrderStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  order_id!: string;

  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus, {
    message:
      'order Status must be Pending, Confirmed, Shipped, Delivered or Cancelled',
  })
  @IsNotEmpty()
  order_status!: string;
}
