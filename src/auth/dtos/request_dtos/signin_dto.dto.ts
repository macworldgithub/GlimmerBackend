import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateCustomerDto } from 'src/customer/dtos/req_dtos/create_customer.dto';
import { CreateStoreDto } from 'src/store/dtos/store.dto';

export class StoreSignInDto extends PickType(CreateStoreDto, [
  'email',
  'password',
] as const) {}

export class CustomerSignInDto extends PickType(CreateCustomerDto, [
  'email',
  'password',
] as const) {}


export class CustomerGoogleSignInDto {
    @IsNotEmpty()
    @IsString()
    id_token: string

    constructor(id_token: string){
        this.id_token = id_token
    }
}
