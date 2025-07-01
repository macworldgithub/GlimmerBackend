import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';
import { Order } from 'src/schemas/ecommerce/order.schema';
import {
  CreateOrderItem,
  OrderItem,
} from 'src/schemas/ecommerce/order_item.schema';
import {
  OrderProjection,
  StoreOrder,
  UpdateStoreOrder,
} from 'src/schemas/ecommerce/store_order.schema';
import { UpdateOrderDto } from './dtos/req_dtos/order.dto';
import { OrderStatus } from './enums/order_status.enum';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name) private order_model: Model<Order>,
    @InjectModel(OrderItem.name) private order_item_model: Model<OrderItem>,
    @InjectModel(StoreOrder.name) private store_order_model: Model<StoreOrder>,
  ) {}

  async create_order(order: Record<string, any>, session?: ClientSession) {
    const inserted_order = new this.order_model(order);
    return inserted_order.save({ session });
  }

  async create_many_order_items(
    order_items: CreateOrderItem[],
    session?: ClientSession,
  ) {
    return this.order_item_model.insertMany(order_items, { session });
  }

  async get_order_by_id(_id: Types.ObjectId, projection?: OrderProjection) {
    return this.order_model
      .findOne({ _id }, projection)
      .populate('order_items')
      .exec();
  }

  async get_order_by_customer_id(
    customer: Types.ObjectId,
    projection?: OrderProjection,
  ) {
    return this.order_model.findOne({ customer }, projection).exec();
  }

  async get_all_orders(page_no: number, projection?: OrderProjection) {
    const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;

    return await this.order_model
      .find({}, projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(DEFAULT_DOCUMENTS_LIMITS)
      .exec();
  }

  async delete_order_by_id(_id: Types.ObjectId) {
    //        return this.order_model.deleteOne({ _id }).exec()
  }

  async update_order_by_id(
    id: Types.ObjectId,
    order_dto: UpdateOrderDto,
    session?: ClientSession | null,
  ) {
    if (!session) session = null;

    return this.order_model
      .findByIdAndUpdate(
        { _id: id },
        order_dto,
        { new: true, runValidators: true }, // `new: true` ensures we get the updated document
      )
      .session(session)
      .exec();
  }

  // store order

  async create_store_order(store_order: StoreOrder) {
    const insert_store_order = new this.store_order_model(store_order);
    return insert_store_order.save();
  }

  async create_many_store_orders(
    store_orders: StoreOrder[],
    session?: ClientSession,
  ) {
    return this.store_order_model.insertMany(store_orders, { session });
  }

  async get_store_order_by_id(
    _id: Types.ObjectId,
    projection?: OrderProjection,
  ) {
    return this.store_order_model
      .findOne({ _id }, projection)
      .populate(['order_items', 'order', 'store'])
      .exec();
  }

  async get_all_store_orders(
    store: Types.ObjectId,
    page_no: number,
    projection?: OrderProjection,
  ) {
    const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;

    return await this.store_order_model
      .find({ store }, projection)
      .sort({ createdAt: -1 })
      .populate(['order_items', 'order'])
      .skip(skip)
      .limit(DEFAULT_DOCUMENTS_LIMITS)
      .exec();
  }

  async delete_store_order_by_id(_id: Types.ObjectId) {
    return this.store_order_model.deleteOne({ _id }).exec();
  }

  async update_store_order_by_id(
    id: Types.ObjectId,
    store_order_dto: UpdateStoreOrder,
  ) {
    return this.store_order_model
      .findByIdAndUpdate(
        { _id: id },
        store_order_dto,
        { new: true, runValidators: true }, // `new: true` ensures we get the updated document
      )
      .exec();
  }

  async get_store_monthly_sales(
    store: Types.ObjectId,
    month: number,
    year: number,
  ) {
    let startOfMonth = new Date(Date.UTC(year, month, 1)); // Start of the month
    let startOfNextMonth = new Date(Date.UTC(year, month + 1, 1)); // Start of the next month

    return this.store_order_model
      .find({
        store,
        created_at: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      })
      .populate(['order_items'])
      .lean()
      .exec();
  }

  async get_total_no_store_orders(
    filters: Partial<StoreOrder>,
    session?: ClientSession | null,
  ) {
    if (!session) session = null;

    return this.store_order_model
      .countDocuments({
        ...filters,
      })
      .session(session)
      .exec();
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.order_model.findOne({ _id:orderId }).exec();
  }

   async update(orderId: string, updateData: Partial<Order>): Promise<Order | null> {
      return this.order_model.findOneAndUpdate({ _id:orderId  }, updateData, { new: true }).exec();
    }
}
