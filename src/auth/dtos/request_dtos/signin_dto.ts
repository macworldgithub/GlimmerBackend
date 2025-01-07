import { PickType } from '@nestjs/swagger';
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
