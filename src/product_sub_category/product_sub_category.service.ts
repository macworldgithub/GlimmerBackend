import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductSubCategoryRepository } from './product_sub_category.repository';
import {
  CreateProductSubCategoryDto,
  UpdateProductSubCategoryDto,
} from './dtos/req_dtos/product_sub_category.dto';
import { Types } from 'mongoose';

@Injectable()
export class ProductSubCategoryService {
  constructor(
    private product_sub_category_repository: ProductSubCategoryRepository,
  ) {}

  async create_product_sub_cateogry(
    create_sub_cat: CreateProductSubCategoryDto,
  ) {
    try {
      return this.product_sub_category_repository.create_product_sub_category(
        create_sub_cat,
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async update_product_sub_cateogry(
    update_cat: UpdateProductSubCategoryDto,
    id: string,
  ) {
    try {
      return this.product_sub_category_repository.update_product_sub_category(
        update_cat,
        new Types.ObjectId(id),
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async get_all_categories() {
    try {
      return this.product_sub_category_repository.get_all_categories();
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async delete_sub_category(id: string) {
    try {
      return this.product_sub_category_repository.delete_sub_category(
        new Types.ObjectId(id),
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }
}
