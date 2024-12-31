import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store } from 'src/schemas/ecommerce/store.schema';
import { CreateStoreDto } from './dtos/store.dto';

@Injectable()
export class StoreService {
     constructor(@InjectModel(Store.name) private store_model: Model<Store>) {}

     async create_store(create_store_dto:  CreateStoreDto){
     }
}
