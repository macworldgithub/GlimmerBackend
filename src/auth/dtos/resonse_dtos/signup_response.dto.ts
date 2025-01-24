import { Admin } from 'src/schemas/admin/admin.schema';
import { Customer } from 'src/schemas/customer.schema';
import { Store } from 'src/schemas/ecommerce/store.schema';

export class StoreSignUpResponseDto {
  store: Store;
  token: string;
  role: string;

  constructor(obj: StoreSignUpResponseDto) {
    this.store = obj.store;
    this.token = obj.token;
    this.role = obj.role;
  }
}

export class CustomerSignUpResponseDto {
  customer: Customer;
  token: string;
  role: string;

  constructor(obj: CustomerSignUpResponseDto) {
    this.customer = obj.customer;
    this.token = obj.token;
    this.role = obj.role;
  }
}
export class AdminSignUpResponseDto {
  admin: Admin;
  token: string;
  role: string;

  constructor(obj: AdminSignUpResponseDto) {
    this.admin= obj.admin;
    this.token = obj.token;
    this.role = obj.role;
  }
}
