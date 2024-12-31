import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreProjection } from 'src/schemas/ecommerce/store.schema';
import { CreateStoreDto } from './dtos/store.dto';

@Injectable()
export class StoreRepository{
    constructor(@InjectModel(Store.name) private store_model: Model<Store>) {}

    async create_store(store_dto : CreateStoreDto){
        const store = new this.store_model(store_dto)
        console.log(store)

        return store.save()
    }


    async get_store_by_email(email: string, projection ?: StoreProjection){
        return this.store_model.findOne({email}, projection).exec()
    }

}
