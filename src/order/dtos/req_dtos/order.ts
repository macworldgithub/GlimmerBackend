import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type as TransformType } from 'class-transformer';

class TypeDTO {
  @IsString()
  id!: string;

  @IsString()
  value!: string;
}

class SizeDTO {
  @IsString()
  id!: string;

  @IsString()
  value!: string;

  @IsString()
  unit!: string;
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

  @ValidateNested()
  @TransformType(() => SizeDTO)
  size!: SizeDTO;

  @ValidateNested()
  @TransformType(() => TypeDTO)
  type!: TypeDTO;
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
