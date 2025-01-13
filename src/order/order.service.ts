import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OrderReqDto } from './dtos/req_dtos/order.dto';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { OrderStatus } from './enums/order_status.enum';
import { OrderRepository } from './order.repository';
import { Connection, Types } from 'mongoose';
import { ProductRepository } from 'src/product/product.repository';
import { InjectConnection } from '@nestjs/mongoose';
import { UpdateStoreDto } from 'src/schemas/ecommerce/store.schema';
import { UpdateStoreOrder } from 'src/schemas/ecommerce/store_order.schema';
import { SSE } from 'src/notifications/sse.service';

@Injectable()
export class OrderService {
    constructor(
        private order_repository: OrderRepository,
        private product_repository: ProductRepository,
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async create_order(order_dto: OrderReqDto, user: AuthPayload) {
        const session = await this.connection.startSession();
        try {
            session.startTransaction();
            const order = {
                status: OrderStatus.CONFIRMED,
                customer: user._id,
            };
            const inserted_order = await this.order_repository.create_order(
                order,
                session,
            );

            const product_ids = order_dto.order_items.map((elem) => elem.product);
            const products = await this.product_repository.get_many_products_by_ids(
                product_ids,
                session,
            );

            const order_items = order_dto.order_items.map((elem) => {
                const product = products.filter(
                    (prod) => elem.product.toString() === prod._id.toString(),
                )[0];
                return { ...elem, product, order: inserted_order._id };
            });
            const inserted_order_items =
                await this.order_repository.create_many_order_items(
                    order_items,
                    session,
                );

            const inserted_order_items_ids = inserted_order_items.map(
                (elem) => elem._id,
            );

            const order_object = inserted_order.toObject();

            const updated_order = await this.order_repository.update_order_by_id(
                inserted_order._id,
                { ...order_object, order_items: inserted_order_items_ids },
                session,
            );

            const stores_products =
                await this.product_repository.get_many_products_by_ids_groupedby_store(
                    // @ts-ignore
                    inserted_order_items.map((elem) => elem.product._id),
                    session,
                );

            const store_orders_obj: any = [];

            stores_products?.forEach((store) => {
                const store_order_obj: any = {
                    status: OrderStatus.CONFIRMED,
                    order: inserted_order._id,
                    store: store._id,
                    order_items: [],
                };
                const store_product_ids = store.products.map((elem) =>
                    elem._id.toString(),
                );
                inserted_order_items.forEach((item) => {
                    // @ts-ignore
                    if (store_product_ids.includes(item.product._id.toString())) {
                        store_order_obj.order_items.push(item._id);
                    }
                });
                store_orders_obj.push(store_order_obj);
            });
            const store_orders = await this.order_repository.create_many_store_orders(
                store_orders_obj,
                session,
            );
            
            store_orders.forEach(ord => {
                SSE.send_notification_to_store(ord.store.toString(), ord)
            })

            await session.commitTransaction();

            return updated_order;
        } catch (e) {
            await session.endSession();
            throw new InternalServerErrorException(e);
        } finally {
            await session.endSession();
        }
    }

    async get_orders(user: AuthPayload) {
        try {
            const order = await this.order_repository.get_order_by_customer_id(
                new Types.ObjectId(user._id),
            );
            return order;
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async get_order_by_id(_id: string) {
        try {
            const order = await this.order_repository.get_order_by_id(
                new Types.ObjectId(_id),
            );
            return order;
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async get_all_store_orders(page_no: number, store_payload: AuthPayload) {
        try {
            const orders = await this.order_repository.get_all_store_orders(new Types.ObjectId(store_payload._id), page_no);
            const total = await this.order_repository.get_total_no_store_orders({ store: new Types.ObjectId(store_payload._id) })

            return { orders, total };
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async get_store_order_by_id(id: string) {
        try {
            const order = await this.order_repository.get_store_order_by_id(
                new Types.ObjectId(id),
            );

            return order;
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async update_store_order_by_id(
        id: string,
        update_store_order_dto: UpdateStoreOrder,
    ) {
        try {
            const order = await this.order_repository.update_store_order_by_id(
                new Types.ObjectId(id),
                update_store_order_dto,
            );

            return order;
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }
}
