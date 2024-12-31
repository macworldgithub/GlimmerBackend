import { PickType } from '@nestjs/swagger'
import { CreateStoreDto } from 'src/store/dtos/store.dto'

export class StoreSignInDto extends PickType(CreateStoreDto, ['email', 'password'] as const) {}
