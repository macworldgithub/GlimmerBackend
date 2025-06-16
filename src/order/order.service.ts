import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
import {
  Order,
  OrderDocument,
  ShippingInfoSchema,
} from 'src/schemas/ecommerce/order.schema';
import { Model } from 'mongoose';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateProductStatusDto,
} from './dtos/req_dtos/order';
import { stat } from 'fs';
import { AdminService } from 'src/admin/admin.service';
import {
  RecommendedProductsDocument,
  RecommendedProducts,
} from 'src/schemas/recommendedProducts/recommendedproducts.schema';
import { OrderGateway } from './order.gateway';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class OrderService {
  constructor(
    private order_repository: OrderRepository,
    private product_repository: ProductRepository,

    private readonly notificationService: NotificationService,
    private readonly orderGateway: OrderGateway,

    private readonly adminService: AdminService,

    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,

    // @InjectConnection() private readonly connection: Connection
  ) {}

  async create_order(
    order_dto: CreateOrderDto,
  ): Promise<{ order: Order; message: string }> {
    const newOrder = new this.orderModel({
      ShippingInfo: order_dto.ShippingInfo,
      customerName: order_dto.customerName,
      customerEmail: order_dto.customerEmail,
      productList: order_dto.productList,
      total: order_dto.total,
      discountedTotal: order_dto.discountedTotal,
      paymentMethod: order_dto.paymentMethod,
    });

    let order = await newOrder.save();

    const message = `A new order has been placed by ${order.customerName}. Please review and process it. Order ID: ${order._id}`;
    const userId = order.productList?.[0]?.storeId;

    if (!userId) {
      console.warn('No storeId found in order.productList');
    }

    await this.notificationService.create(userId, message, order);

    this.orderGateway.sendOrderNotification(order);
    return { order: order, message: 'SucessFully Created Order' };
  }

  async get_all_store_orders(
    page_no: number,
    id: string,
    orderIdPrefix?: string,
    customerEmail?: string,
    status?: string,
  ) {
    try {
      const limit = 10;
      const skip = (page_no - 1) * limit;

      const validStatuses = ['Accepted', 'Rejected', 'Pending'];

      const matchFilter: any = {
        'productList.storeId': id,
        // 'productList.orderProductStatus': { $ne: 'Pending' },
      };

      if (status && validStatuses.includes(status)) {
        matchFilter['productList.orderProductStatus'] = status;
      }

      const pipeline: any[] = [
        {
          $addFields: {
            stringId: { $toString: '$_id' },
          },
        },
        { $match: matchFilter },
      ];

      if (orderIdPrefix) {
        pipeline.push({
          $match: {
            stringId: { $regex: `^${orderIdPrefix}` },
          },
        });
      }

      if (customerEmail) {
        pipeline.push({
          $match: {
            customerEmail: { $regex: customerEmail, $options: 'i' },
          },
        });
      }
      const total = await this.orderModel.aggregate([
        ...pipeline,
        { $count: 'totalCount' },
      ]);
      const totalCount = total.length > 0 ? total[0].totalCount : 0;

      pipeline.push(
        {
          $project: {
            _id: 1,
            customerName: 1,
            customerEmail: 1,
            total: 1,
            status: 1,
            discountedTotal: 1,
            paymentMethod: 1,
            ShippingInfo: 1,
            createdAt: 1,
            productList: {
              $filter: {
                input: '$productList',
                as: 'product',
                cond: { $eq: ['$$product.storeId', id] },
              },
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        { $skip: skip },
        { $limit: limit },
      );

      const orders = await this.orderModel.aggregate(pipeline);

      return {
        orders,
        totalCount,
        currentPage: page_no,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async get_store_revenue_sales(
    page_no: number,
    store_id: string,
    orderIdPrefix?: string,
    status?: string,
  ) {
    try {
      let currentPage = 1;
      let totalPages = 1;

      // Initialize revenue and sales count
      let totalRevenue = 0;
      let salesCount = {
        Accepted: 0,
        Rejected: 0,
        Pending: 0,
      };

      let allOrders: any[] = [];
      let totalCount = 0;

      while (currentPage <= totalPages) {
        const orderData = await this.get_all_store_orders(
          currentPage,
          store_id,
          orderIdPrefix,
          status,
        );
        if (currentPage === 1) {
          totalPages = orderData.totalPages;
          totalCount = orderData.totalCount;
        }

        allOrders = allOrders.concat(orderData.orders);
        orderData.orders.forEach((order) => {
          order.productList.forEach((product: any) => {
            const productStatus = product.orderProductStatus;
            // Increment sales count based on product orderProductStatus
            if (salesCount.hasOwnProperty(productStatus)) {
              salesCount[productStatus as keyof typeof salesCount]++;
            }

            totalRevenue += product.discounted_price ?? product.total_price;
          });
        });

        currentPage++;
      }

      return {
        orders: allOrders,
        totalRevenue,
        salesCount,
        totalCount,
        currentPage: page_no,
        totalPages,
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async get_order_by_id(_id: string) {
    try {
      const order = await this.orderModel.find({
        _id: new Types.ObjectId(_id),
      });
      return order;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }
  async get_store_order_by_id(storeId: string, orderId: string) {
    try {
      const pipeline: any[] = [
        {
          $match: {
            _id: new Types.ObjectId(orderId), // Match specific order
            'productList.storeId': storeId, // Ensure order contains a product from the store
          },
        },
        {
          $project: {
            _id: 1,
            customerName: 1,
            customerEmail: 1,
            total: 1,
            status: 1,
            discountedTotal: 1,
            paymentMethod: 1,
            ShippingInfo: 1,
            productList: {
              $filter: {
                input: '$productList',
                as: 'product',
                cond: { $eq: ['$$product.storeId', storeId] }, // Keep only store's product(s)
              },
            },
          },
        },
      ];

      const orders = await this.orderModel.aggregate(pipeline);

      return orders.length > 0 ? orders[0] : null; // Return the entire order with filtered product list
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async update_order_status(
    order: UpdateOrderStatusDto,
    user: AuthPayload,
  ): Promise<any> {
    const result = await this.orderModel.updateOne(
      {
        _id: order.order_id,
      },
      {
        status: order.order_status,
      },
    );

    if (result.modifiedCount === 0) {
      throw new BadRequestException(
        'Order  not found or you are not authorized to update it.',
      );
    }

    let message = '';
    switch (order.order_status) {
      case 'Pending':
        message = 'Your order is pending and awaiting confirmation.';
        break;
      case 'Confirmed':
        message = 'Your order has been confirmed and is being processed.';
        break;
      case 'Shipped':
        message = 'Your order has been shipped and is on the way.';
        break;
      case 'Delivered':
        message = 'Your order has been delivered successfully.';
        break;
      case 'Cancelled':
        message = 'Your order has been cancelled.';
        break;
      default:
        message = 'Order status updated successfully.';
    }

    return {
      message,
      status: order.order_status,
      orderId: order.order_id,
    };
  }
  async delete_order(order_id: string): Promise<any> {
    const result = await this.orderModel.deleteOne({
      _id: order_id,
    });

    return {
      message: 'Order Deleted',
    };
  }
  async update_product_status_of_order_provided(
    order: UpdateProductStatusDto,
    user: AuthPayload,
  ): Promise<any> {
    const productCheck =
      await this.product_repository.get_product_by_store_id_product_id(
        new Types.ObjectId(order.product_id),
        new Types.ObjectId(order.store_id),
      );

    if (!productCheck) {
      throw new NotFoundException('Product not found.');
    }

    if (order.order_product_status == 'Accepted') {
      const orderDetails = await this.orderModel.findOne({
        _id: order.order_id,
        'productList.product._id': order.product_id,
        'productList.storeId': order.store_id,
      });

      if (!orderDetails) {
        throw new NotFoundException('Order not found.');
      }

      const productInOrder = orderDetails.productList.find(
        (item) => item.product._id.toString() === order.product_id,
      );

      if (!productInOrder) {
        throw new NotFoundException('Product not found in the order.');
      }

      if (productInOrder.quantity > productCheck.quantity) {
        throw new BadRequestException(
          `Order quantity exceeds available stock (${productCheck.quantity}).`,
        );
      }
      const minusStock = await this.product_repository.update_product(
        new Types.ObjectId(order.product_id),
        new Types.ObjectId(order.store_id),
        { quantity: productCheck.quantity - productInOrder.quantity },
      );
    }
    const result = await this.orderModel.updateOne(
      { _id: order.order_id }, // Find order by ID
      {
        $set: {
          'productList.$[elem].orderProductStatus': order.order_product_status,
        },
      },
      {
        arrayFilters: [
          {
            'elem.product._id': order.product_id,
            'elem.storeId': order.store_id,
          },
        ],
      },
    );
    console.log(result, 'result');
    if (result.modifiedCount === 0) {
      throw new BadRequestException(
        'Order or product not found or you are not authorized to update it.',
      );
    }

    let message = '';
    switch (order.order_product_status) {
      case 'Pending':
        message =
          'The product status has been set to Pending. Awaiting further processing.';
        break;
      case 'Accepted':
        message =
          'The product has been confirmed and is now being prepared for shipment.';
        break;
      case 'Rejected':
        message = 'The product has been Rejected.';
        break;
      default:
        message = 'Product status updated successfully.';
    }

    return {
      message,
      status: order.order_product_status,
      orderId: order.order_id,
      productId: order.product_id,
    };
  }

  async get_all_admin_orders(
    page_no: string,
    orderIdPrefix?: string,
    status?: string,
  ) {
    try {
      const page = parseInt(page_no) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const validStatuses = [
        'Pending',
        'Confirmed',
        'Shipped',
        'Delivered',
        'Cancelled',
      ];

      const matchFilter: any = { status: { $ne: 'Pending' } };

      if (status && validStatuses.includes(status)) {
        matchFilter.status = status;
      }

      const pipeline: any[] = [
        {
          $addFields: {
            stringId: { $toString: '$_id' },
          },
        },
        { $match: matchFilter },
      ];

      if (orderIdPrefix) {
        pipeline.push({
          $match: {
            stringId: { $regex: `^${orderIdPrefix}` },
          },
        });
      }

      const total = await this.orderModel.aggregate([
        ...pipeline,
        { $count: 'totalCount' },
      ]);
      const totalOrders = total.length > 0 ? total[0].totalCount : 0;

      pipeline.push(
        {
          $project: {
            _id: 1,
            customerName: 1,
            customerEmail: 1,
            total: 1,
            productList: 1,
            discountedTotal: 1,
            paymentMethod: 1,
            ShippingInfo: 1,
            status: 1,
          },
        },
        { $skip: skip },
        { $limit: limit },
      );

      const orders = await this.orderModel.aggregate(pipeline);

      return {
        data: orders,
        page,
        limit,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  // async get_all_store_orders(page_no: number, store_payload: AuthPayload) {
  //   try {
  //     const orders = await this.order_repository.get_all_store_orders(
  //       new Types.ObjectId(store_payload._id),
  //       page_no,
  //     );
  //     const total = await this.order_repository.get_total_no_store_orders({
  //       store: new Types.ObjectId(store_payload._id),
  //     });

  //     return { orders, total };
  //   } catch (e) {
  //     console.log(e);
  //     throw new InternalServerErrorException(e);
  //   }
  // }

  // async get_store_order_by_id(id: string) {
  //   try {
  //     const order = await this.order_repository.get_store_order_by_id(
  //       new Types.ObjectId(id),
  //     );

  //     return order;
  //   } catch (e) {
  //     console.log(e);
  //     throw new InternalServerErrorException(e);
  //   }
  // }
  // async get_store_order_by_id(id: string) {
  //   try {
  //     const order = await this.orderModel.aggregate([{
  //       $match: {
  //         "productList.storeId": id
  //       }
  //     }]);

  //     return order;
  //   } catch (e) {
  //     console.log(e);
  //     throw new InternalServerErrorException(e);
  //   }
  // }

  // async update_store_order_by_id(
  //   id: string,
  //   update_store_order_dto: UpdateStoreOrder,
  // ) {
  //   try {
  //     const order = await this.order_repository.update_store_order_by_id(
  //       new Types.ObjectId(id),
  //       update_store_order_dto,
  //     );

  //     return order;
  //   } catch (e) {
  //     console.log(e);
  //     throw new InternalServerErrorException(e);
  //   }
  // }

  // async getOrdersByStore(
  //   status: string,
  //   store_payload: AuthPayload,
  //   page: string = '1', // Default to page 1
  //   limit: string = '8', // Limit of 8 orders per page
  // ): Promise<{ orders: any[]; totalPages: number }> {
  //   // Fetch all orders from the database (can be optimized with pagination in DB query)

  //   const orders: any[] = await this.orderModel.find().lean();

  //   // Filter orders based on the status
  //   const filteredOrders: any[] = orders
  //     // .filter((order) => {
  //     //   if (status === 'Pending') {
  //     //     return order.status === 'Pending';
  //     //   }
  //     //   if (status === '') {
  //     //     return order.status !== 'Pending';
  //     //   }
  //     //   return order.status === status;
  //     // })
  //     .map((order) => {
  //       const { productList, ...rest } = order;
  //       const items = productList.filter((item: any) => {
  //         const isFromStore = item.product.store === store_payload._id;

  //         if (!status) {
  //           // If status is empty, show all except "Pending"
  //           return isFromStore && item.product.status !== 'Pending';
  //         }

  //         // Otherwise, show only the specific status
  //         return isFromStore && item.product.status === status;
  //       });

  //       return { ...rest, items };
  //     })

  //     .filter((order) => order.items.length > 0); // Remove orders with no matching items

  //   // Calculate total number of pages
  //   const totalOrders = filteredOrders.length;
  //   const totalPages = Math.ceil(totalOrders / parseInt(limit));

  //   // Implement pagination
  //   const startIndex = (parseInt(page) - 1) * parseInt(limit);
  //   const paginatedOrders = filteredOrders.slice(
  //     startIndex,
  //     startIndex + parseInt(limit),
  //   );

  //   return {
  //     orders: paginatedOrders,
  //     totalPages,
  //   };
  // }

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
}
