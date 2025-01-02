import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';
import { Order } from 'src/schemas/ecommerce/order.schema';
import { CreateOrderItem, OrderItem } from 'src/schemas/ecommerce/order_item.schema';
import { OrderProjection } from 'src/schemas/ecommerce/store_order.schema';
import { UpdateOrderDto } from './dtos/req_dtos/order.dto';

@Injectable()
export class OrderRepository {
    constructor(@InjectModel(Order.name) private order_model: Model<Order>, @InjectModel(OrderItem.name) private order_item_model: Model<OrderItem>) { }

    async create_order(order: Record<string, any>) {
        const inserted_order = new this.order_model(order)
        return inserted_order.save()
    }

    async create_many_order_items(order_items: CreateOrderItem[]) {
        return this.order_item_model.insertMany(order_items)
    }


    async get_order_by_id(_id: Types.ObjectId, projection?: OrderProjection) {
        return this.order_model.findOne({ _id }, projection).populate("order_items").exec()
    }


    async get_order_by_customer_id(customer: Types.ObjectId, projection?: OrderProjection) {
        return this.order_model.findOne({ customer }, projection).exec()
    }

    async get_all_orders(page_no: number, projection?: OrderProjection) {

        const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS

        return await this.order_model
            .find({
            }, projection)
            .skip(skip)
            .limit(DEFAULT_DOCUMENTS_LIMITS)
            .exec()
    }


    async delete_order_by_id(_id: Types.ObjectId) {
        //        return this.order_model.deleteOne({ _id }).exec()
    }


    async update_order_by_id(id: Types.ObjectId, order_dto: UpdateOrderDto) {

        return this.order_model.findByIdAndUpdate(
            { _id: id },
            order_dto,
            { new: true, runValidators: true } // `new: true` ensures we get the updated document
        ).exec();

    }

}
