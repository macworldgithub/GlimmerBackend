import { Injectable, InternalServerErrorException} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductItemRepository } from './product_item.repository';
import { CreateProducItemDto, UpdateProductItemDto } from './dtos/request_dtos/product_item.dto';

@Injectable()
export class ProductItemService{
  constructor(
    private product_item_repository: ProductItemRepository,
  ) {}

  async create_product_item(
    create_sub_cat: CreateProducItemDto,
  ) {
    try {
      return this.product_item_repository.create_product_item(
        create_sub_cat,
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async update_product_item(
    update: UpdateProductItemDto,
    id: string,
  ) {
    try {
      return this.product_item_repository.update_product_item(
        update,
        new Types.ObjectId(id),
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async get_all_categories() {
    try {
      return this.product_item_repository.get_all_categories();
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async delete_item(id: string) {
    try {
      return this.product_item_repository.delete_product_item(
        new Types.ObjectId(id),
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }
}
