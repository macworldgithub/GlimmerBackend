// @ts-nocheck
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsStrongPassword,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  store_name: string;

  @IsString()
  @IsNotEmpty()
  vendor_name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEmail()
  @IsNotEmpty()
  store_contact_email: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: '3rd image file of the product',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  store_image?: Express.Multer.File;
}

