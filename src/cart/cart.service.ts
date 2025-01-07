import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CartDto, UpdateCartDto } from './dtos/req_dtos/cart.dto';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { Cart } from 'src/schemas/ecommerce/cart.schema';
import { Types } from 'mongoose';

@Injectable()
export class CartService {
  constructor(private cart_repository: CartRepository) {}

  async crate_cart(cart_dto: CartDto, user: AuthPayload) {
    try {
      const is_cart_already_crated = await this.get_cart(user);
      if (is_cart_already_crated) {
        throw new BadRequestException('Cart for this user already exists!');
      }
      const cart: Cart = {
        customer: new Types.ObjectId(user._id),
        cart_items: cart_dto.cart_items,
      };
      const inserted_cart = await this.cart_repository.create_cart(cart);
      return inserted_cart;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async get_cart(user: AuthPayload) {
    try {
      const cart = await this.cart_repository.get_cart_by_customer_id(
        new Types.ObjectId(user._id),
      );
      return cart;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async get_cart_by_id(_id: string) {
    try {
      const cart = await this.cart_repository.get_cart_by_id(
        new Types.ObjectId(_id),
      );
      return cart;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async update_cart_by_customer_id(
    customer: Types.ObjectId,
    update_cart_dto: UpdateCartDto,
  ) {
    try {
      const cart = await this.cart_repository.update_cart_by_customer_id(
        customer,
        update_cart_dto,
      );
      return cart;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }
}
