import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductDto } from 'src/order/dtos/req_dtos/order';

export class JazzCashCallbackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pp_TxnRefNo!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pp_Amount!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pp_SecureHash!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pp_CustomerEmail!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pp_CustomerMobile!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pp_ResponseCode!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pp_BillReference?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pp_CustomerName!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pp_city!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pp_state!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pp_zip!: string;

  @ApiProperty({ type: [ProductDto] }) // Important
  ppmpf_1!: ProductDto[];
}
