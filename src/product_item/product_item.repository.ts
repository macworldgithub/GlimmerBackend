import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Types } from 'mongoose';
import { ProductItem } from 'src/schemas/ecommerce/product_item.schema';
import {
  CreateProducItemDto,
  UpdateProductItemDto,
} from './dtos/request_dtos/product_item.dto';
import { ProductCategory } from 'src/schemas/ecommerce/product_category.schema';

@Injectable()
export class ProductItemRepository {
  constructor(
    @InjectModel(ProductItem.name)
    private product_item_model: Model<ProductItem>,
    @InjectModel(ProductCategory.name)
    private product_category_model: Model<ProductCategory>,
  ) {}

  async create_product_item(create_product_item: CreateProducItemDto) {
    const item = new this.product_item_model(create_product_item);
    return item.save();
  }

  async update_product_item(item: UpdateProductItemDto, id: Types.ObjectId) {
    return this.product_item_model
      .findByIdAndUpdate(
        { _id: id },
        item,
        { new: true, runValidators: true }, // `new: true` ensures we get the updated document
      )
      .exec();
  }

  async get_item_by_ids(
    item_id: Types.ObjectId,
    sub_category_id: Types.ObjectId,
  ) {
    return this.product_item_model
      .findOne({ _id: item_id, product_sub_category: sub_category_id })
      .exec();
  }

  async get_all_categories() {
    return this.product_category_model
      .aggregate([
        {
          $lookup: {
            from: 'productsubcategories', // Name of the sub-category collection
            localField: '_id',
            foreignField: 'product_category',
            as: 'sub_categories',
          },
        },
        {
          $unwind: {
            path: '$sub_categories',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'productitems', // Name of the item collection
            localField: 'sub_categories._id',
            foreignField: 'product_sub_category',
            as: 'sub_categories.items',
          },
        },
        {
          $group: {
            _id: '$_id',
            product_category: { $first: '$$ROOT' },
            sub_categories: { $push: '$sub_categories' },
          },
        },
        {
          $project: {
            'product_category.sub_categories': 0, // Remove duplicate sub_categories key in product_category
          },
        },
      ])
      .exec();
  }

  async delete_product_item(id: Types.ObjectId) {
    return this.product_item_model.deleteOne({ _id: id }).exec();
  }

  async delete_item_by_sub_category_id(
    sub_category_id: Types.ObjectId,
    session?: ClientSession | null,
  ) {
    if (!session) session = null;
    return this.product_item_model
      .deleteMany({ product_sub_category: sub_category_id })
      .session(session)
      .exec();
  }
  async find_by_slug(slug: string) {
    return this.product_item_model.findOne({ slug }).exec();
  }

  async find_by_id(id: Types.ObjectId) {
    return this.product_item_model.findById(id).exec();
  }

  async findOne(query: any): Promise<ProductItem | null> {
    if (query.slug) {
      query.slug = { $regex: `^${query.slug}$`, $options: 'i' };
    }
    return this.product_item_model.findOne(query).exec();
  }
}
