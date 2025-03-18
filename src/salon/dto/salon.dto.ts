import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSalonDto {
  @ApiProperty({ description: 'The name of the salon' })
  @IsString()
  @IsNotEmpty()
  salon_name!: string;

  @ApiProperty({ description: 'The name of the owner' })
  @IsString()
  @IsNotEmpty()
  owner_name!: string;

  @ApiProperty({ description: 'The contact email of the owner' })
  @IsEmail()
  @IsNotEmpty()
  owner_contact_email!: string;

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

  @ApiPropertyOptional({ description: 'Salon image', type: 'string', format: 'binary' })
  @IsOptional()
  salon_image?: Express.Multer.File;
}
