import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Types } from 'mongoose';
import { ProductItem } from 'src/schemas/ecommerce/product_item.schema';
import { CreateProducItemDto, UpdateProductItemDto } from './dtos/request_dtos/product_item.dto';

@Injectable()
export class ProductItemRepository {
  constructor(
    @InjectModel(ProductItem.name)
    private product_item_model: Model<ProductItem>,
  ) {}

  async create_product_item(
    create_product_item: CreateProducItemDto,
  ) {
    const item = new this.product_item_model(create_product_item);
    return item.save();
  }

  async update_product_item(
    item: UpdateProductItemDto,
    id: Types.ObjectId,
  ) {
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
      .findOne({ _id: item_id, product_sub_category : sub_category_id})
      .exec();
  }

  async get_all_categories() {
    return this.product_item_model
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

  async delete_product_item(id: Types.ObjectId) {
    return this.product_item_model.deleteOne({ _id: id }).exec();
  }

  async delete_item_by_sub_category_id(
    sub_category_id: Types.ObjectId,
    session?: ClientSession | null,
  ) {
    if (!session) session = null;
    return this.product_item_model
      .deleteMany({ product_sub_category: sub_category_id})
      .session(session)
      .exec();
  }
}
