import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;
}
