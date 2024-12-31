// @ts-nocheck

import { IsString, IsEmail, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';

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
  vendor_email: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  store_image?: string;

}

