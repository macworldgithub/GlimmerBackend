import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Types } from 'mongoose';
import {
  CreateProductSubCategoryDto,
  UpdateProductSubCategoryDto,
} from './dtos/req_dtos/product_sub_category.dto';
import { ProductSubCategory } from 'src/schemas/ecommerce/product_sub_category.schema';

@Injectable()
export class ProductSubCategoryRepository {
  constructor(
    @InjectModel(ProductSubCategory.name)
    private product_sub_category_model: Model<ProductSubCategory>,
  ) {}

  async create_product_sub_category(
    create_sub_cat: CreateProductSubCategoryDto,
  ) {
    const product_cat = new this.product_sub_category_model(create_sub_cat);
    return product_cat.save();
  }

  async update_product_sub_category(
    update_sub_cat: UpdateProductSubCategoryDto,
    id: Types.ObjectId,
  ) {
    return this.product_sub_category_model
      .findByIdAndUpdate(
        { _id: id },
        update_sub_cat,
        { new: true, runValidators: true }, // `new: true` ensures we get the updated document
      )
      .exec();
  }

  async get_sub_category_by_ids(
    category_id: Types.ObjectId,
    sub_category_id: Types.ObjectId,
  ) {
    return this.product_sub_category_model
      .findOne({ _id: sub_category_id, product_category: category_id })
      .exec();
  }

  async get_all_categories() {
    return this.product_sub_category_model
      .aggregate([
        {
          $group: {
            _id: '$product_category', // Group by product_category
            sub_categories: { $push: '$$ROOT' }, // Include all sub-category details
          },
        },
        {
          $lookup: {
            from: 'productcategories',
            localField: '_id',
            foreignField: '_id',
            as: 'product_category', // Populate the product_category
          },
        },
        {
          $unwind: '$product_category', // Flatten the product_category array
        },
      ])
      .exec();
  }

  async delete_sub_category(id: Types.ObjectId) {
    return this.product_sub_category_model.deleteOne({ _id: id }).exec();
  }

  async delete_sub_category_by_category_id(
    category_id: Types.ObjectId,
    session?: ClientSession | null,
  ) {
    if (!session) session = null;
    return this.product_sub_category_model
      .deleteMany({ product_category: category_id })
      .session(session)
      .exec();
  }
}
