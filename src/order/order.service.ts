import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OrderReqDto } from './dtos/req_dtos/order.dto';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { OrderStatus } from './enums/order_status.enum';
import { OrderRepository } from './order.repository';
import { Connection, Types } from 'mongoose';
import { ProductRepository } from 'src/product/product.repository';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { UpdateStoreOrder } from 'src/schemas/ecommerce/store_order.schema';
import { SSE } from 'src/notifications/sse.service';
import { SSE_EVENTS } from 'src/commons/enums/sse_types.enum';

import { Order, OrderDocument } from 'src/schemas/ecommerce/order.schema';
import { Model } from 'mongoose';
import { OrderDTO } from './dtos/req_dtos/order';
import { stat } from 'fs';

@Injectable()
export class OrderService {
  constructor(
    private order_repository: OrderRepository,
    private product_repository: ProductRepository,

    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,

    // @InjectConnection() private readonly connection: Connection
  ) {}

  // async create_order(order_dto: OrderReqDto, user: AuthPayload) {
  //   const session = await this.connection.startSession();
  //   try {
  //     session.startTransaction();
  //     const order = {
  //       status: OrderStatus.CONFIRMED,
  //       customer: user._id,
  //       payment_method: order_dto.payment_method,
  //     };
  //     const inserted_order = await this.order_repository.create_order(
  //       order,
  //       session,
  //     );

  //     const product_ids = order_dto.order_items.map((elem) => elem.product);
  //     const products = await this.product_repository.get_many_products_by_ids(
  //       product_ids,
  //       session,
  //     );

  //     const order_items = order_dto.order_items.map((elem) => {
  //       const product = products.filter(
  //         (prod) => elem.product.toString() === prod._id.toString(),
  //       )[0];
  //       return { ...elem, product, order: inserted_order._id };
  //     });
  //     const inserted_order_items =
  //       await this.order_repository.create_many_order_items(
  //         order_items,
  //         session,
  //       );

  //     const inserted_order_items_ids = inserted_order_items.map(
  //       (elem) => elem._id,
  //     );

  //     const order_object = inserted_order.toObject();

  //     const updated_order = await this.order_repository.update_order_by_id(
  //       inserted_order._id,
  //       { ...order_object, order_items: inserted_order_items_ids },
  //       session,
  //     );

  //     const stores_products =
  //       await this.product_repository.get_many_products_by_ids_groupedby_store(
  //         // @ts-ignore
  //         inserted_order_items.map((elem) => elem.product._id),
  //         session,
  //       );

  //     const store_orders_obj: any = [];

  //     stores_products?.forEach((store) => {
  //       const store_order_obj: any = {
  //         status: OrderStatus.CONFIRMED,
  //         order: inserted_order._id,
  //         store: store._id,
  //         order_items: [],
  //       };
  //       const store_product_ids = store.products.map((elem) =>
  //         elem._id.toString(),
  //       );
  //       inserted_order_items.forEach((item) => {
  //         // @ts-ignore
  //         if (store_product_ids.includes(item.product._id.toString())) {
  //           store_order_obj.order_items.push(item._id);
  //         }
  //       });
  //       store_orders_obj.push(store_order_obj);
  //     });
  //     const store_orders = await this.order_repository.create_many_store_orders(
  //       store_orders_obj,
  //       session,
  //     );

  //     store_orders.forEach((ord) => {
  //       SSE.send_notification_to_store(ord.store.toString(), {
  //         order: ord,
  //         type: SSE_EVENTS.ORDER_PLACED,
  //       });
  //     });

  //     await session.commitTransaction();

  //     return updated_order;
  //   } catch (e) {
  //     await session.endSession();
  //     throw new InternalServerErrorException(e);
  //   } finally {
  //     await session.endSession();
  //   }
  // }

  async create_order(order_dto: OrderDTO, user: AuthPayload): Promise<Order> {
    const newOrder = new this.orderModel({
      shippingInfo: order_dto.shippingInfo,
      productList: order_dto.ProductList, // Copying products from DTO
      total: order_dto.total,
      discountedTotal: order_dto.discountedTotal,
      status: order_dto.status,
    });

    return await newOrder.save();
  }

  async update_product_status_of_order_provided(
    Order: any,
    user: AuthPayload,
  ): Promise<any> {
    const result = await this.orderModel.updateOne(
      {
        _id: Order.orderId,
        'productList.product._id': Order.productId,
        'productList.product.store': user._id,
      },
      { $set: { 'productList.$.product.status': Order.status } },
    );

    if (result.modifiedCount === 0) {
      throw new Error(
        'Order or product not found or you are not authorized to update it.',
      );
    }

    let message = '';

    switch (Order.status) {
      case 'Pending':
        message =
          'The product status has been set to Pending. Awaiting further processing.';
        break;
      case 'Confirmed':
        message =
          'The product has been confirmed and is now being prepared for shipment.';
        break;
      case 'Shipped':
        message =
          'The product has been shipped. Tracking details may be available soon.';
        break;
      case 'Delivered':
        message =
          'The product has been successfully delivered to the customer.';
        break;
      case 'Cancelled':
        message = 'The product order has been cancelled as per the request.';
        break;
      default:
        message = 'Product status updated successfully.';
    }

    return {
      message,
      status: Order.status,
      orderId: Order.orderId,
      productId: Order.productId,
    };
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
      const orders = await this.order_repository.get_all_store_orders(
        new Types.ObjectId(store_payload._id),
        page_no,
      );
      const total = await this.order_repository.get_total_no_store_orders({
        store: new Types.ObjectId(store_payload._id),
      });

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

  async getOrdersByStore(
    status: string,
    store_payload: AuthPayload,
    page: string = '1', // Default to page 1
    limit: string = '8', // Limit of 8 orders per page
  ): Promise<{ orders: any[]; totalPages: number }> {
    // Fetch all orders from the database (can be optimized with pagination in DB query)

    const orders: any[] = await this.orderModel.find().lean();

    // Filter orders based on the status
    const filteredOrders: any[] = orders
      // .filter((order) => {
      //   if (status === 'Pending') {
      //     return order.status === 'Pending';
      //   }
      //   if (status === '') {
      //     return order.status !== 'Pending';
      //   }
      //   return order.status === status;
      // })
      .map((order) => {
        const { productList, ...rest } = order;
        const items = productList.filter((item: any) => {
          const isFromStore = item.product.store === store_payload._id;

          if (!status) {
            // If status is empty, show all except "Pending"
            return isFromStore && item.product.status !== 'Pending';
          }

          // Otherwise, show only the specific status
          return isFromStore && item.product.status === status;
        });

        return { ...rest, items };
      })

      .filter((order) => order.items.length > 0); // Remove orders with no matching items

    // Calculate total number of pages
    const totalOrders = filteredOrders.length;
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    // Implement pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedOrders = filteredOrders.slice(
      startIndex,
      startIndex + parseInt(limit),
    );

    return {
      orders: paginatedOrders,
      totalPages,
    };
  }
}
