import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';
import {
  Product,
  ProductProjection,
} from 'src/schemas/ecommerce/product.schema';
import { ProductsByStore } from './types/many_store_products.type';
import { UpdateProductDto } from './dtos/request_dtos/product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name) private product_model: Model<Product>,
  ) {}

  async create_product(product_dto: Record<string, any>) {
    const product = new this.product_model(product_dto);
    console.log(product);

    return product.save();
  }

  async get_product_by_id(_id: Types.ObjectId, projection?: ProductProjection) {
    return this.product_model.findOne({ _id }, projection).exec();
  }

  async get_product_by_store_id_product_id(
    _id: Types.ObjectId,
    store_id: Types.ObjectId,
    projection?: ProductProjection,
  ) {
    return this.product_model
      .findOne({ _id, store: store_id }, projection)
      .exec();
  }

 

  async get_all_store_products(
  page_no: number,
  projection?: ProductProjection,
  filters: Partial<Product> = {},
) {
  const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;

  return this.product_model
    .find(
      {
        ...filters, // Filters already include the store ID
      },
      projection,
    )
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(DEFAULT_DOCUMENTS_LIMITS)
    .exec();
}
  // async get_all_products(
  //   page_no: number,
  //   projection?: ProductProjection,
  //   filters: Partial<Product> = {},
  // ) {
  //   const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;

  //   return this.product_model
  //     .find(
  //       {
  //         ...filters,
  //       },
  //       projection,
  //     )
  //     .sort({ createdAt: -1 })
  //     .skip(skip)
  //     .limit(DEFAULT_DOCUMENTS_LIMITS)
  //     .exec();
  // }

  async get_all_products(
  page_no: number,
  projection?: ProductProjection,
  filters: Partial<Product> = {},
  sortBy?: string, // Add sortBy parameter
  order?: 'asc' | 'desc', // Add order parameter
) {
  const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;

  let sortOptions: any = { createdAt: -1, _id: -1 }; // Default sort with secondary key for stability

  if (sortBy === 'price') {
    // Sort by discounted_price or base_price
    sortOptions = [
      ['discounted_price', order === 'desc' ? -1 : 1],
      ['base_price', order === 'desc' ? -1 : 1],
      ['_id', order === 'desc' ? -1 : 1],
  ];
  } else if (sortBy) {
    sortOptions = { [sortBy]: order === 'desc' ? -1 : 1, _id: order === 'desc' ? -1 : 1 };
  } else {
    // When no sortBy, respect the order for createdAt
    sortOptions = { createdAt: order === 'desc' ? -1 : 1, _id: order === 'desc' ? -1 : 1 };
  }

  console.log('MongoDB query:', { filters, sortOptions, skip, limit: DEFAULT_DOCUMENTS_LIMITS });

  return this.product_model
    .find(
      {
        ...filters,
      },
      projection,
    )
    .sort(sortOptions)
    .skip(skip)
    .limit(DEFAULT_DOCUMENTS_LIMITS)
    .exec();
}
  async delete_product_by_store_id_product_id(_id: Types.ObjectId) {
    return this.product_model.deleteOne({ _id }).exec();
  }

  // async update_product(
  //   id: Types.ObjectId,
  //   store_id: Types.ObjectId,
  //   product_dto: UpdateProductDto,
  // ) {
  //   return this.product_model
  //     .findByIdAndUpdate(
  //       { _id: id, store: store_id },
  //       product_dto,
  //       { new: true, runValidators: true }, // `new: true` ensures we get the updated document
  //     )
  //     .exec();
  // }

  async update_product(
  id: Types.ObjectId,
  store_id: Types.ObjectId | undefined,
  product_dto: UpdateProductDto,
) {
  const filter: any = { _id: id };
  if (store_id) {
    filter.store = store_id; // Add store filter only if store_id is provided
  }

  return this.product_model
    .findOneAndUpdate(
      filter,
      product_dto,
      { new: true, runValidators: true }, // `new: true` ensures we get the updated document
    )
    .exec();
}
  async get_many_products_by_ids_groupedby_store(
    product_ids: Types.ObjectId[],
    session?: ClientSession | null,
  ): Promise<ProductsByStore[] | null> {
    if (!session) session = null;

    console.log(product_ids, 'PRODUCT IDS');
    return this.product_model
      .aggregate([
        {
          $match: { _id: { $in: product_ids } },
        },
        {
          $group: {
            _id: '$store',
            products: { $push: '$$ROOT' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .session(session)
      .exec();
  }

  async get_many_products_by_ids(
    product_ids: Types.ObjectId[],
    session?: ClientSession | null,
  ) {
    if (!session) session = null;

    return this.product_model
      .find({
        _id: { $in: product_ids },
      })
      .session(session)
      .exec();
  }

  async get_total_no_products_by_store_id(
    filters: Partial<Product>,
    session?: ClientSession | null,
  ) {
    if (!session) session = null;

    return this.product_model
      .countDocuments({
        ...filters,
      })
      .session(session)
      .exec();
  }

  // async bulk_update_product_prices(
  //   discount: number,
  //   productIds: Types.ObjectId[],
  // ): Promise<any> {
  //   try {
  //     // Fetch all products for the store
  //     const store_products = await this.product_model.find({
  //       _id: { $in: productIds },
  //     });
  //     console.log(store_products)
  //     if (!store_products.length)
  //       throw new Error('No products found for this store');

  //     // Prepare bulk update queries
  //     const updatedProducts = store_products.map((product) => {
  //       // const hasDiscountedPrice = product.discounted_price != null;
  //       const hasDiscountedPrice = product.discounted_price != 0;
  //       const priceToDiscount = hasDiscountedPrice
  //         ? product.discounted_price
  //         : product.base_price;
  //        const newPrice = priceToDiscount - (priceToDiscount * discount) / 100;

  //       return {
  //         updateOne: {
  //           filter: { _id: product._id },
  //           update: {
  //             $set: hasDiscountedPrice
  //             ? { discounted_price: newPrice }
  //             : { base_price: newPrice },
  //           },
  //         },
  //       };
  //     });
      
  //     // Perform bulk update
  //     const bulkWriteResult =
  //       await this.product_model.bulkWrite(updatedProducts);

  //     return bulkWriteResult; // Returning the result from bulkWrite
  //   } catch (e) {
  //     console.error(e);
  //     throw new Error('Failed to update product prices');
  //   }
  // }
  async bulk_update_product_prices(
  discount: number,
  productIds: Types.ObjectId[],
): Promise<any> {
  try {
    // Fetch all products for the store
    const store_products = await this.product_model.find({
      _id: { $in: productIds },
    });
    console.log(store_products);

    if (!store_products.length) {
      throw new Error('No products found for this store');
    }

    // Prepare bulk update queries
    const updatedProducts = store_products.map((product) => {
      // Use base_price as the reference price for discount calculation
      const referencePrice =  product.base_price;

      // Calculate the new discounted price
      const newDiscountedPrice = referencePrice - (referencePrice * discount) / 100;

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              discounted_price: newDiscountedPrice, // Always update discounted_price
            },
          },
        },
      };
    });

    // Perform bulk update
    const bulkWriteResult = await this.product_model.bulkWrite(updatedProducts);

    return bulkWriteResult; // Returning the result from bulkWrite
  } catch (e) {
    console.error(e);
    throw new Error('Failed to update product prices');
  }
}
  async update_product_rating(
    id: Types.ObjectId,
    update: any,
  ) {
    return this.product_model
      .findByIdAndUpdate(
        id,
        update,
        { new: true, runValidators: true },
      )
      .exec();
  }
  async get_store_product_count(store_id: Types.ObjectId): Promise<number> {
  try {
    return this.product_model.countDocuments({ store: store_id }).exec();
  } catch (e) {
    console.error(e);
    throw new Error('Failed to count store products');
  }
}
// Add this new method within the ProductRepository class
async get_all_rated_products(pipeline: any[]): Promise<any[]> {
  return this.product_model.aggregate(pipeline).exec();
}
}