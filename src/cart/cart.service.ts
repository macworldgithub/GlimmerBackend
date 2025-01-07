import { Injectable } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CartDto } from './dtos/req_dtos/cart.dto';

@Injectable()
export class CartService {
    constructor(private cart_repository: CartRepository) { }

    async crate_cart(cart_dto: CartDto, user: AuthPayload) {
        const session = await this.connection.startSession();
        try {
            session.startTransaction();
            const order = {
                status: OrderStatus.CONFIRMED,
                customer: user._id,
            }
            const inserted_order = await this.order_repository.create_order(order, session)

            const product_ids = order_dto.order_items.map(elem => elem.product)
            const products = await this.product_repository.get_many_products_by_ids(product_ids, session)

            const order_items = order_dto.order_items.map(elem => {
                const product = products.filter(prod => elem.product.toString() === prod._id.toString())[0]
                return ({ ...elem, product, order: inserted_order._id })
            })
            const inserted_order_items = await this.order_repository.create_many_order_items(order_items, session)

            const inserted_order_items_ids = inserted_order_items.map(elem => (elem._id))

            const order_object = inserted_order.toObject()

            const updated_order = await this.order_repository.update_order_by_id(inserted_order._id, { ...order_object, order_items: inserted_order_items_ids }, session)

            // @ts-ignore
            const stores_products = await this.product_repository.get_many_products_by_ids_groupedby_store(inserted_order_items.map(elem => elem.product._id), session)

            const store_orders_obj: any = []

            stores_products?.forEach((store) => {
                const store_order_obj: any = {
                    status: OrderStatus.CONFIRMED,
                    order: inserted_order._id,
                    store: store._id,
                    order_items: []
                }
                const store_product_ids = store.products.map(elem => elem._id.toString())
                inserted_order_items.forEach(item => {
                    // @ts-ignore
                    if (store_product_ids.includes(item.product._id.toString())) {
                        store_order_obj.order_items.push(item._id)
                    }
                })
                store_orders_obj.push(store_order_obj)
            })
            await this.order_repository.create_many_store_orders(store_orders_obj, session)

            await session.commitTransaction()

            return updated_order

        } catch (e) {
            await session.endSession()
            throw new InternalServerErrorException(e)
        } finally {
            await session.endSession();
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
