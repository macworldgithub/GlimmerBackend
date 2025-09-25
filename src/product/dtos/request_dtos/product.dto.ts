// @ts-nocheck
import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { ProductStatus } from 'src/product/enums/product_status.enum';

export class CreateProductDto {
  // req-dto-decorators
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;   

  // req-dto-decorators
  @IsInt()
  @Min(0)
  @Max(Infinity)
  @Transform(({ value }) => parseInt(value, 10))
  quantity: number;

  // req-dto-decorators
  @IsString()
  @IsOptional()
  description?: string;

  // req-dto-decorators
  @ApiPropertyOptional({
    description: 'First image file of the product',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image1?: Express.Multer.File;

  // req-dto-decorators

  @ApiPropertyOptional({
    description: '2nd image file of the product',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image2?: Express.Multer.File;

  // req-dto-decorators

  @ApiPropertyOptional({
    description: '3rd image file of the product',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image3?: Express.Multer.File;

  // req-dto-decorators
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  @Max(Infinity)
  base_price: number;

  // req-dto-decorators
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  @Max(Infinity)
  discounted_price: number;

  // req-dto-decorators
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsMongoId()
  category: Types.ObjectId;

  @IsMongoId()
  sub_category: Types.ObjectId;

  @IsString()
  item: Types.ObjectId;

  @IsArray()
  @IsOptional()
  size?: any[];

  @IsArray()
  @IsOptional()
  type?: any[];

  constructor(product: CreateProductDto) {
    if (!product) return;
    this.name = product.name;
    this.status = product.status;
    this.image1 = product.image1;
    this.image2 = product.image2;
    this.image3 = product.image3;
    this.quantity = product.quantity;
    this.base_price = product.base_price;
    this.description = product.description;
    this.discounted_price = product.discounted_price;
    this.category = product.category;
    this.sub_category = product.sub_category;
    this.item = product.item;

    this.type = product.type;
    this.size = product.size;
  }
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  constructor(ob: UpdateProductDto) {
    super(ob);
  }

  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Updated first image file of the product',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image1?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Updated second image file of the product',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image2?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Updated third image file of the product',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image3?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Updated category ID of the product',
    type: 'string',
    example: '60d5ec49d2a3e209c8a5f6b7',
  })
  @IsOptional()
  @IsMongoId()
  category?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Updated sub-category ID of the product',
    type: 'string',
    example: '60d5ec49d2a3e209c8a5f6b8',
  })
  @IsOptional()
  @IsMongoId()
  sub_category?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Updated item ID of the product',
    type: 'string',
    example: '60d5ec49d2a3e209c8a5f6b9',
  })
  @IsOptional()
  @IsMongoId()
  item?: Types.ObjectId;

  @IsArray()
  @IsOptional()
  size?: any[];

  @IsArray()
  @IsOptional()
  type?: any[];
}
