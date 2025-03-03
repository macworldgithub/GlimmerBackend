import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
  IsDefined,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { Type as TransformType } from 'class-transformer';

class ProductDTO {
  @IsString()
  _id!: string;

  @IsString()
  name!: string;

  @IsNumber()
  base_price!: number;

  @IsNumber()
  discounted_price!: number;

  @IsString()
  description!: string;

  @IsString()
  image1!: string;

  @IsString()
  image2!: string;

  @IsString()
  image3!: string;

  @IsString()
  status!: string;

  @IsString()
  orderProductStatus: 'Pending' | 'Reject' | 'Accept' = 'Pending';

  @IsString()
  store!: string;

  size!: any;

  type!: any;
}

class ShippingInfoDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  country!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  city!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  state!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  zip!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  fulfillmentMethod!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  paymentMethod!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsBoolean()
  agree!: boolean;
}

class CompleteOrderDTO {
  @ValidateNested()
  @TransformType(() => ProductDTO)
  product!: ProductDTO;

  @IsNumber()
  quantity!: number;
}

export class OrderDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @TransformType(() => CompleteOrderDTO)
  ProductList!: CompleteOrderDTO[];

  @IsNumber()
  total!: number;

  @IsNumber()
  discountedTotal!: number;

  shippingInfo!: ShippingInfoDTO;

  @IsString()
  status!: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
}
