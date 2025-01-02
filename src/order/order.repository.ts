import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';
import { Order, OrderDocument } from 'src/schemas/ecommerce/order.schema';
import { Product, ProductProjection, UpdateProductDto } from 'src/schemas/ecommerce/product.schema';

@Injectable()
export class  OrderRepository{
    constructor(@InjectModel(Order.name) private order_model: Model<Order>) { }

    async create_order(order: OrderDocument) {

        const inserted_order = new this.order_model(order)
        return inserted_order.save()
    }


    async get_product_by_id(_id: Types.ObjectId, projection?: ProductProjection) {
        return this.product_model.findOne({ _id }, projection).exec()
    }

    async get_product_by_store_id_product_id(_id: Types.ObjectId, store_id: Types.ObjectId, projection?: ProductProjection) {
        return this.product_model.findOne({ _id, store: store_id }, projection).exec()
    }


    async get_all_store_products(store_id: Types.ObjectId, page_no: number, projection?: ProductProjection) {

        const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS

        return await this.product_model
            .find({
                store: store_id
            }, projection)
            .skip(skip)
            .limit(DEFAULT_DOCUMENTS_LIMITS)
            .exec()
    }


    async delete_product_by_store_id_product_id(_id: Types.ObjectId, store_id: Types.ObjectId) {
        return this.product_model.deleteOne({ _id, store: store_id }).exec()
    }




    async update_product(id: Types.ObjectId, store_id: Types.ObjectId, product_dto: UpdateProductDto) {

        return this.product_model.findByIdAndUpdate(
            { _id: id, store: store_id },
            product_dto,
            { new: true, runValidators: true } // `new: true` ensures we get the updated document
        ).exec();

    }
}
