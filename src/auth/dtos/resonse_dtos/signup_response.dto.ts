import { Store } from 'src/schemas/ecommerce/store.schema'

export class StoreSignUpResponseDto {
  store : Store
  token : string

  constructor(obj: StoreSignUpResponseDto) {
    this.store= obj.store
    this.token= obj.token
  }
}
