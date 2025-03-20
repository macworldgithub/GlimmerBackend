// @ts-nocheck
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
export class CreateSalonServiceDto {
  @ApiProperty({ example: 'Haircut', description: 'The name of the service' })
  @IsString()
  @IsNotEmpty()
  name!: string;
 
  @ApiProperty({
    example: '12345',
    description: 'The category ID of the service',
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({
    example: 'Hair Services',
    description: 'Sub-category name (optional)',
  })
  @IsString()
  @IsOptional()
  subCategoryName?: string;

  @ApiPropertyOptional({
    example: 'Men’s Haircut',
    description: 'Sub-sub-category name (optional)',
  })
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


  @IsString()
  @IsOptional()
  subSubCategoryName?: string;

  @ApiPropertyOptional({
    example: 'A professional haircut service.',
    description: 'Description of the service',
  })
  @IsString()
  description?: string;

  @ApiProperty({
    example: 30,
    description: 'Duration of the service in minutes',
  })
  @IsNotEmpty()
  duration: number;

  @ApiProperty({ example: 100, description: 'Actual price of the service' })
  @IsNotEmpty()
  requestedPrice: number;
}

export class UpdateSalonServiceDto {
  @ApiProperty({
    example: '60d5f3b1fc13ae4567890123',
    description: 'ID of the service',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;
  @ApiProperty({ example: 'Haircut', description: 'The name of the service' })
  @IsString()
  @IsOptional()
  name!: string;

  @ApiProperty({
    example: '12345',
    description: 'The category ID of the service',
  })
  @IsString()
  @IsOptional()
  categoryId!: string;

  @ApiPropertyOptional({
    example: 'Hair Services',
    description: 'Sub-category name (optional)',
  })
  @IsString()
  @IsOptional()
  subCategoryName?: string;

  @ApiPropertyOptional({
    example: 'Men’s Haircut',
    description: 'Sub-sub-category name (optional)',
  })
  @IsString()
  @IsOptional()
  subSubCategoryName?: string;

  @ApiPropertyOptional({
    example: 'A professional haircut service.',
    description: 'Description of the service',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 30,
    description: 'Duration of the service in minutes',
  })
  @IsNumber()
  @IsOptional()
  duration: number;
}

export class RequestPriceUpdateDto {
  @ApiProperty({
    example: '60d5f3b1fc13ae4567890123',
    description: 'ID of the service',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;
  @ApiProperty({
    example: 150,
    description: 'Requested new price for the service',
  })
  @IsNumber()
  @IsNotEmpty()
  requestedPrice: number;
}

export class ApprovePriceUpdateDto {
  @ApiProperty({
    example: '60d5f3b1fc13ae4567890123',
    description: 'ID of the service',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;
  @ApiProperty({ example: 100, description: 'Actual price of the service' })
  @IsNumber()
  adminSetPrice: number;
}

export class ApplyDiscountDto {
  @ApiProperty({
    example: '60d5f3b1fc13ae4567890123',
    description: 'ID of the service',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;
  @ApiPropertyOptional({
    example: 15,
    description: 'Discount percentage (0-100)',
  })
  @IsNumber()
  discountPercentage?: number;
}
export class ApplyBulkDiscountDto {
  @ApiProperty({
    example: ['60d5f3b1fc13ae4567890123', '60d5f3b1fc13ae4567890123'],
    description: 'ID of the service',
  })
  @IsArray()
  @IsNotEmpty()
  id!: string[];
  @ApiPropertyOptional({
    example: 15,
    description: 'Discount percentage (0-100)',
  })
  @IsNumber()
  discountPercentage?: number;
}

export class RemoveDiscountDto {
  @ApiProperty({
    example: '60d5f3b1fc13ae4567890123',
    description: 'ID of the service',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;
}
