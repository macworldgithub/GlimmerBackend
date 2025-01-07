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

  async get_all_store_orders(page_no: number, projection?: OrderProjection) {
    const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;

    return await this.store_order_model
      .find({}, projection)
      .populate(['order_items', 'order', 'store'])
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
    return this.order_model
      .findByIdAndUpdate(
        { _id: id },
        store_order_dto,
        { new: true, runValidators: true }, // `new: true` ensures we get the updated document
      )
      .exec();
  }
}
