import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SalonStatus } from '../enums/salon_status.enum';
import { IsEnum } from 'class-validator';


export class CreateSalonDto {
  @ApiProperty({ description: 'The name of the salon' })
  @IsString()
  @IsNotEmpty()
  salon_name!: string;

  @ApiProperty({ description: 'Salon email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Salon password' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ description: 'Contact number of the salon' })
  @IsString()
  @IsNotEmpty()
  contact_number!: string;

  @ApiProperty({ description: 'Address of the salon' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional({ description: 'About the salon' })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({ description: 'Opening Hour of salon' })
  @IsString()
  @IsOptional()
  openingHour?: string;

  @ApiPropertyOptional({ description: 'Closing Hour of salon' })
  @IsString()
  @IsOptional()
  closingHour?: string;

  @ApiPropertyOptional({
    description: 'Salon image',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image1?: Express.Multer.File;
  
  
  @ApiPropertyOptional({
    description: 'Salon image',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image2?: Express.Multer.File;
  
  @ApiPropertyOptional({
    description: 'Salon image',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image3?: Express.Multer.File;
  
  @ApiPropertyOptional({
    description: 'Salon image',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image4?: Express.Multer.File;
}

export class UpdateSaloonDto {
  @ApiPropertyOptional({ description: 'The name of the salon' })
  @IsString()
  @IsOptional()
  salon_name?: string;

  // @ApiPropertyOptional({ description: 'Salon password' })
  // @IsString()
  // @IsOptional()
  // password?: string;
  
  @ApiPropertyOptional({ description: 'Opening Hour of salon' })
  @IsString()
  @IsOptional()
  openingHour?: string;
  
  @ApiPropertyOptional({ description: 'Closing Hour of salon' })
  @IsString()
  @IsOptional()
  closingHour?: string;

  @ApiPropertyOptional({ description: 'Contact number of the salon' })
  @IsString()
  @IsOptional()
  contact_number?: string;

  @ApiPropertyOptional({ description: 'Address of the salon' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'About the salon' })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({
    description: 'Salon image',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image1?: Express.Multer.File;
  
  
  @ApiPropertyOptional({
    description: 'Salon image',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image2?: Express.Multer.File;
  
  @ApiPropertyOptional({
    description: 'Salon image',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image3?: Express.Multer.File;
  
  @ApiPropertyOptional({
    description: 'Salon image',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image4?: Express.Multer.File;
}

export class UpdateSalonStatusDto {
  @ApiProperty({
    description: 'New status of the salon',
    enum: SalonStatus,
    example: SalonStatus.ACTIVE,
  })
  @IsEnum(SalonStatus)
  status!: SalonStatus;
}
