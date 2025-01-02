import { Injectable } from '@nestjs/common';
import { OrderReqDto } from './dtos/req_dtos/order.dto';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { OrderStatus } from './enums/order_status.enum';
import { OrderRepository } from './order.repository';
import { Types } from 'mongoose';

@Injectable()
export class OrderService {
    constructor(private order_repository: OrderRepository) { }

    async create_order(order_dto: OrderReqDto, user: AuthPayload) {
        try {
            const order = {
                status: OrderStatus.CONFIRMED,
                customer: user._id,
            }
            const inserted_order = await this.order_repository.create_order(order)

            const order_items = order_dto.order_items.map(elem => ({...elem, order: inserted_order._id}))
            const inserted_order_items = await this.order_repository.create_many_order_items(order_items)

            const inserted_order_items_ids = inserted_order_items.map(elem => (elem._id))

            const temp = inserted_order.toObject()
            const updated_order = await this.order_repository.update_order_by_id(inserted_order._id, { ...temp , order_items : inserted_order_items_ids })


            console.log(updated_order)
            return updated_order

        } catch (e) {
        }
    }


    async get_orders(user: AuthPayload) {
        try {
            const order = await this.order_repository.get_order_by_customer_id(new Types.ObjectId(user._id))
            return order

        } catch (e) {
        }
    }


    async get_order_by_id(_id: string) {
        try {
            const order = await this.order_repository.get_order_by_id(new Types.ObjectId(_id))
            return order
        } catch (e) {
        }
    }

}
