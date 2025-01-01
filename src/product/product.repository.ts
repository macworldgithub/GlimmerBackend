import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';
import { Product, ProductProjection } from 'src/schemas/ecommerce/product.schema';

@Injectable()
export class ProductRepository {
    constructor(@InjectModel(Product.name) private product_model: Model<Product>) { }

    async create_product(product_dto: Product) {

        const product = new this.product_model(product_dto)
        console.log(product)

        return product.save()
    }


    async get_product_by_id(_id: Types.ObjectId, projection?: ProductProjection) {
        return this.product_model.findOne({ _id }, projection).exec()
    }

    async get_product_by_store_id_product_id(_id: Types.ObjectId, store_id: Types.ObjectId, projection?: ProductProjection) {
        return this.product_model.findOne({ _id, store: store_id }, projection).exec()
    }


    async get_all_store_products(store_id: Types.ObjectId, page_no: number, projection?: ProductProjection) {

        const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS

        return this.product_model
            .find({
                store: store_id
            }, projection)
            .skip(skip)
            .limit(DEFAULT_DOCUMENTS_LIMITS)
            .exec()
    }

}
