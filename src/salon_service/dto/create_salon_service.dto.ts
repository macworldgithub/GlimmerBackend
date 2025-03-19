// @ts-nocheck
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
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
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ example: 100, description: 'Actual price of the service' })
  @IsNumber()
  @Min(0)
  requestedPrice: number;
}

export class UpdateSalonServiceDto {
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
  @Min(1)
  @IsOptional()
  duration: number;

  @ApiProperty({ example: 100, description: 'Actual price of the service' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  requestedPrice: number;
}

export class RequestPriceUpdateDto {
  @ApiProperty({
    example: 150,
    description: 'Requested new price for the service',
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  requestedPrice: number;
}

export class ApprovePriceUpdateDto {
  @ApiProperty({
    example: 'approved',
    enum: ['approved', 'rejected'],
    description: 'Admin approval status',
  })
  @IsString()
  @IsNotEmpty()
  status: 'approved' | 'rejected';
  @ApiProperty({ example: 100, description: 'Actual price of the service' })
  @IsNumber()
  @Min(0)
  adminSetPrice: number;
}

export class ApplyDiscountDto {
  @ApiPropertyOptional({
    example: 15,
    description: 'Discount percentage (0-100)',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({
    example: true,
    description: 'Apply discount globally to all services',
  })
  @IsBoolean()
  @IsNotEmpty()
  isGlobalDiscount: boolean;
}
