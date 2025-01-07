import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';
import { Cart, CartProjection } from 'src/schemas/ecommerce/cart.schema';
import { UpdateCartDto } from './dtos/req_dtos/cart.dto';

@Injectable()
export class CartRepository {
  constructor(@InjectModel(Cart.name) private cart_model: Model<Cart>) {}

  async create_cart(cart: Cart, session?: ClientSession) {
    const inserted_cart = new this.cart_model(cart);
    return inserted_cart.save({ session });
  }

  async get_cart_by_id(_id: Types.ObjectId, projection?: CartProjection) {
    return this.cart_model
      .findOne({ _id }, projection)
      .populate('cart_items')
      .exec();
  }

  async get_cart_by_customer_id(
    customer: Types.ObjectId,
    projection?: CartProjection,
  ) {
    return this.cart_model
      .findOne({ customer }, projection)
      .populate({
        path: 'cart_items.product',
        select:
          'name description images base_price discounted_price status store',
      })
      .exec();
  }

  async get_all_carts(page_no: number, projection?: CartProjection) {
    const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;

    return await this.cart_model
      .find({}, projection)
      .skip(skip)
      .limit(DEFAULT_DOCUMENTS_LIMITS)
      .exec();
  }

  async delete_order_by_id(_id: Types.ObjectId) {
    //        return this.order_model.deleteOne({ _id }).exec()
  }

  async update_cart_by_customer_id(
    customer: Types.ObjectId,
    cart_dto: UpdateCartDto,
    session?: ClientSession | null,
  ) {
    if (!session) session = null;

    return this.cart_model
      .updateOne(
        { customer },
        cart_dto,
        { new: true, runValidators: true }, // `new: true` ensures we get the updated document
      )
      .session(session)
      .exec();
  }
}
