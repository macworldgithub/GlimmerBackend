import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store } from 'src/schemas/ecommerce/store.schema';
import { CreateStoreDto } from './dtos/store.dto';

@Injectable()
export class StoreRepository{
    constructor(@InjectModel(Store.name) private store_model: Model<Store>) {}

    async create_store(store_dto : CreateStoreDto){
        const store = new this.store_model(store_dto)
        console.log(store)

        return store.save()
    }

}
