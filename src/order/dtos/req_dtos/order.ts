import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type as TransformType } from 'class-transformer';

class TypeDTO {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  value?: string;
}

class SizeDTO {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  unit?: string;
}

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
  store!: string;

  size!: any;

  type!: any;
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

  @IsString()
  status!: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
}
