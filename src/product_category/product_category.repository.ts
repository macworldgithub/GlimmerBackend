import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { ProductCategory } from 'src/schemas/ecommerce/product_category.schema';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dtos/req_dtos/product_category.dto';
import { Types } from 'mongoose';

@Injectable()
export class ProductCategoryRepository {
  constructor(
    @InjectModel(ProductCategory.name)
    private product_category_model: Model<ProductCategory>,
  ) {}

  async create_product_category(create_cat: CreateProductCategoryDto) {
    const product_cat = new this.product_category_model(create_cat);
    return product_cat.save();
  }

  async update_product_category(
    update_cat: UpdateProductCategoryDto,
    id: Types.ObjectId,
  ) {
    return this.product_category_model
      .findByIdAndUpdate(
        { _id: id },
        update_cat,
        { new: true, runValidators: true }, // `new: true` ensures we get the updated document
      )
      .exec();
  }

  async get_all_categories() {
    return this.product_category_model.find({}).exec();
  }

  async delete_product_category(
    id: Types.ObjectId,
    session?: ClientSession | null,
  ) {
    if (!session) session = null;
    return this.product_category_model
      .deleteOne({ _id: id })
      .session(session)
      .exec();
  }

  async find_by_slug(slug: string) {
    return this.product_category_model.findOne({ slug }).exec();
  }

  async find_by_id(id: Types.ObjectId) {
    return this.product_category_model.findById(id).exec();
  }

  async findOne(query: any): Promise<ProductCategory | null> {
    if (query.slug) {
      query.slug = { $regex: `^${query.slug}$`, $options: 'i' };
    }
    return this.product_category_model.findOne(query).exec();
  }
}
