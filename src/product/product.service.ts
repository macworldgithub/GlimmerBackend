import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  Product,
  ProductProjection,
} from 'src/schemas/ecommerce/product.schema';
import { ProductRepository } from './product.repository';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { FilterQuery, Types } from 'mongoose';
import { PaginatedDataDto } from 'src/commons/dtos/request_dtos/pagination.dto';
import { isMongoId, validate } from 'class-validator';
import { DeleteResponse } from 'src/commons/dtos/response_dtos/delete.dto';
import { S3Service } from 'src/aws/s3.service';
import { RatingRepository } from 'src/product/rating.repository'; 
import { Roles } from 'src/auth/enums/roles.enum';

import {
  CreateProductDto,
  UpdateProductDto,
} from './dtos/request_dtos/product.dto';
import { ProductFiles } from './types/update_product.type';
import { ProductSubCategoryRepository } from 'src/product_sub_category/product_sub_category.repository';

import { v4 as uuidv4 } from 'uuid';
import { SubmitRatingDto } from './dtos/request_dtos/rating.dto';


@Injectable()
export class ProductService {
  constructor(
    private product_repository: ProductRepository,
    private sub_category_repository: ProductSubCategoryRepository,
    private s3_service: S3Service,
    private rating_repository: RatingRepository,
  ) {}

  private static readonly GET_PRODUCT_IMAGE_PATH = (id: string) => {
    return 'glimmer/brands/' + id + '/product_images';
  };

  private extractDynamicFields(data: any, prefix: string): any[] {
    const result = [];

    for (const key in data) {
      if (key.startsWith(prefix)) {
        try {
          const parsedObject = JSON.parse(data[key]); // Convert string to object
          parsedObject.id = uuidv4(); // Assign a unique UUID
          result.push(parsedObject);
        } catch (e) {
          console.error(`Invalid format for key ${key}:`, data[key]);
        }
      }
    }

    return result;
  }

  async create_product(
    product_dto: CreateProductDto,
    requestBody: any,
    store_payload: AuthPayload,
  ) {
    try {
      // Extract and parse size and type fields dynamically
      product_dto.size = this.extractDynamicFields(requestBody, 'size');
      product_dto.type = this.extractDynamicFields(requestBody, 'type');

      const are_categories_valid =
        await this.sub_category_repository.get_sub_category_by_ids(
          new Types.ObjectId(product_dto.category),
          new Types.ObjectId(product_dto.sub_category),
        );

      if (!are_categories_valid)
        throw new BadRequestException(
          `The selected sub-category does not belong to the specified category. Please ensure your selection is correct`,
        );

      const path = ProductService.GET_PRODUCT_IMAGE_PATH(store_payload._id);
      let product_temp: any = structuredClone(product_dto);

      if (product_dto.image1) {
        product_temp.image1 = (
          await this.s3_service.upload_file(product_dto.image1, path)
        ).Key;
      }
      if (product_dto.image2) {
        product_temp.image2 = (
          await this.s3_service.upload_file(product_dto.image2, path)
        ).Key;
      }
      if (product_dto.image3) {
        product_temp.image3 = (
          await this.s3_service.upload_file(product_dto.image3, path)
        ).Key;
      }

      product_temp.store = new Types.ObjectId(store_payload._id);
      product_temp.category = new Types.ObjectId(product_dto.category);
      product_temp.sub_category = new Types.ObjectId(product_dto.sub_category);

      const product =
        await this.product_repository.create_product(product_temp);

      if (product.image1) {
        product.image1 = await this.s3_service.get_image_url(product.image1);
      }
      if (product.image2) {
        product.image2 = await this.s3_service.get_image_url(product.image2);
      }
      if (product.image3) {
        product.image3 = await this.s3_service.get_image_url(product.image3);
      }

      return new Product(product);
    } catch (e) {
      console.log('le bhai dekh ', product_dto, e);
      throw new InternalServerErrorException(e);
    }
  }

  async get_store_product_by_id(
    id: string,
    store_payload: AuthPayload,
    projection?: ProductProjection,
  ): Promise<Product> {
    try {
      const product =
        await this.product_repository.get_product_by_store_id_product_id(
          new Types.ObjectId(id),
          new Types.ObjectId(store_payload._id),
          projection,
        );

      if (!product) {
        throw new BadRequestException('Product doesnot exist');
      }
      if (product.image1) {
        product.image1 = await this.s3_service.get_image_url(product.image1);
      }
      if (product.image2) {
        product.image2 = await this.s3_service.get_image_url(product.image2);
      }
      if (product.image3) {
        product.image3 = await this.s3_service.get_image_url(product.image3);
      }

      return new Product(product);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async delete_store_product_by_id(
    id: string,
  ): Promise<DeleteResponse> {
    try {
      const product =
        await this.product_repository.delete_product_by_store_id_product_id(
          new Types.ObjectId(id),
        );

      if (!product.deletedCount) {
        throw new BadRequestException('Product doesnot exist');
      }

      return { ...product, message: 'success' };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  // async get_all_store_products(
  //   // store_payload: AuthPayload,
  //   page_no: number,
  //   category?: string,
  //   sub_category?: string,
  //   item?: string,
  //   store?: string,
  //   name?: string,
  //   projection?: ProductProjection,
  // ): Promise<{ products: Product[]; total: number }> {
  //   try {
  //     const params = new PaginatedDataDto(page_no);

  //     const is_valid = await validate(params, {
  //       validationError: { target: false },
  //     });
  //     if (is_valid.length) {
  //       throw new BadRequestException('Incorrect page no value');
  //     }

  //     if (
  //       category &&
  //       sub_category &&
  //       (!isMongoId(category) || !isMongoId(sub_category))
  //     )
  //       throw new BadRequestException('invalid category or sub category!');
  //     let filters: FilterQuery<Product> = {};

  //     if (category) {
  //       filters.category = new Types.ObjectId(category);
  //     }
  //     if (sub_category) {
  //       filters.sub_category = new Types.ObjectId(sub_category);
  //     }
  //     if (item && item !== 'all') {
  //       filters.item = new Types.ObjectId(item);
  //     }
  //     if (store) {
  //       filters.store = new Types.ObjectId(store);
  //     }
  //     if (name) {
  //       filters.name = { $regex: name, $options: 'i' };
  //     }
  //     const products_res = await this.product_repository.get_all_store_products(
  //       // new Types.ObjectId(store_payload._id),
  //       page_no,
  //       projection,
  //       filters,
  //     );

  //     if (!products_res) {
  //       throw new BadRequestException('Product doesnot exist');
  //     }

  //     const products = await Promise.all(
  //       products_res.map(async (prod) => {
  //         if (prod.image1) {
  //           prod.image1 = await this.s3_service.get_image_url(prod.image1);
  //         }
  //         if (prod.image2) {
  //           prod.image2 = await this.s3_service.get_image_url(prod.image2);
  //         }
  //         if (prod.image3) {
  //           prod.image3 = await this.s3_service.get_image_url(prod.image3);
  //         }

  //         return prod;
  //       }),
  //     );

  //     const total =
  //       await this.product_repository.get_total_no_products_by_store_id({
  //         // store: new Types.ObjectId(store_payload._id),
  //         ...filters,
  //       });

  //     return { products: products.map((prod) => new Product(prod)), total };
  //   } catch (e) {
  //     console.log(e);
  //     throw new InternalServerErrorException(e);
  //   }
  // }

  async get_all_store_products(
  store_payload: AuthPayload,
  page_no: number,
  category?: string,
  sub_category?: string,
  item?: string,
  name?: string,
  projection?: ProductProjection,
): Promise<{ products: Product[]; total: number }> {
  try {
    const params = new PaginatedDataDto(page_no);

    const is_valid = await validate(params, {
      validationError: { target: false },
    });
    if (is_valid.length) {
      throw new BadRequestException('Incorrect page no value');
    }

    if (
      category &&
      sub_category &&
      (!isMongoId(category) || !isMongoId(sub_category))
    ) {
      throw new BadRequestException('invalid category or sub category!');
    }

    let filters: FilterQuery<Product> = {};
    // Only filter by store if the user is a STORE role
    if (store_payload.role === Roles.STORE) {
      filters.store = new Types.ObjectId(store_payload._id);
    }

    if (category) {
      filters.category = new Types.ObjectId(category);
    }
    if (sub_category) {
      filters.sub_category = new Types.ObjectId(sub_category);
    }
    if (item && item !== 'all') {
      filters.item = new Types.ObjectId(item);
    }
    if (name) {
      filters.name = { $regex: name, $options: 'i' };
    }

    const products_res = await this.product_repository.get_all_store_products(
      page_no,
      projection,
      filters,
    );

    if (!products_res) {
      throw new BadRequestException('Product does not exist');
    }

    const products = await Promise.all(
      products_res.map(async (prod) => {
        if (prod.image1) {
          prod.image1 = await this.s3_service.get_image_url(prod.image1);
        }
        if (prod.image2) {
          prod.image2 = await this.s3_service.get_image_url(prod.image2);
        }
        if (prod.image3) {
          prod.image3 = await this.s3_service.get_image_url(prod.image3);
        }
        return prod;
      }),
    );

    const total = await this.product_repository.get_total_no_products_by_store_id({
      ...filters,
    });

    return { products: products.map((prod) => new Product(prod)), total };
  } catch (e) {
    console.log(e);
    throw new InternalServerErrorException(e);
  }
}
  // async update_store_product(
  //   id: string,
  //   store_payload: AuthPayload,
  //   update_product_dto: UpdateProductDto,
  //   files: ProductFiles,
  //   requestBody: any,
  // ): Promise<Product> {
  //   try {
  //     update_product_dto.size = this.extractDynamicFields(requestBody, 'size');
  //     update_product_dto.type = this.extractDynamicFields(requestBody, 'type');

  //     const store_product =
  //       await this.product_repository.get_product_by_store_id_product_id(
  //         new Types.ObjectId(id),
  //         new Types.ObjectId(store_payload._id),
  //         { name: 1, image2: 1, image1: 1, image3: 1 },
  //       );
  //     if (!store_product) throw new BadRequestException('Product not found');

  //     const path = ProductService.GET_PRODUCT_IMAGE_PATH(store_payload._id);

  //     let product_temp: any = structuredClone(update_product_dto);
  //     console.log(files, 'files', update_product_dto);

  //     if (files?.image1?.length) {
  //       if (store_product.image1) {
  //         product_temp.image1 = (
  //           await this.s3_service.upload_file_by_key(
  //             files.image1[0],
  //             store_product.image1,
  //           )
  //         ).Key;
  //       } else {
  //         product_temp.image1 = (
  //           await this.s3_service.upload_file(files.image1[0], path)
  //         ).Key;
  //       }
  //     } else {
  //       delete product_temp.image1;
  //     }
  //     if (files?.image2?.length) {
  //       if (store_product.image2) {
  //         product_temp.image2 = (
  //           await this.s3_service.upload_file_by_key(
  //             files.image2[0],
  //             store_product.image2,
  //           )
  //         ).Key;
  //       } else {
  //         product_temp.image2 = (
  //           await this.s3_service.upload_file(files.image2[0], path)
  //         ).Key;
  //       }
  //     } else {
  //       delete product_temp.image2;
  //     }
  //     if (files?.image3?.length) {
  //       if (store_product.image3) {
  //         product_temp.image3 = (
  //           await this.s3_service.upload_file_by_key(
  //             files.image3[0],
  //             store_product.image3,
  //           )
  //         ).Key;
  //       } else {
  //         product_temp.image3 = (
  //           await this.s3_service.upload_file(files.image3[0], path)
  //         ).Key;
  //       }
  //     } else {
  //       delete product_temp.image3;
  //     }

  //     console.log(product_temp);
  //     const product = await this.product_repository.update_product(
  //       new Types.ObjectId(id),
  //       new Types.ObjectId(store_payload._id),
  //       product_temp,
  //     );
  //     if (!product) {
  //       throw new BadRequestException('Product doesnot exist');
  //     }
  //     if (product.image1) {
  //       product.image1 = await this.s3_service.get_image_url(product.image1);
  //     }
  //     if (product.image2) {
  //       product.image2 = await this.s3_service.get_image_url(product.image2);
  //     }
  //     if (product.image3) {
  //       product.image3 = await this.s3_service.get_image_url(product.image3);
  //     }
  //     return new Product(product);
  //   } catch (e) {
  //     console.log(e, 'udpate');
  //     throw new InternalServerErrorException(e);
  //   }
  // }
  async update_store_product(
  id: string,
  store_payload: AuthPayload,
  update_product_dto: UpdateProductDto,
  files: ProductFiles,
  requestBody: any,
): Promise<Product> {
  try {
    update_product_dto.size = this.extractDynamicFields(requestBody, 'size');
    update_product_dto.type = this.extractDynamicFields(requestBody, 'type');

    // Determine if the user is a Super Admin
    const isSuperAdmin = store_payload.role === Roles.SUPERADMIN;

    // Fetch the product based on role
    let store_product;
    if (isSuperAdmin) {
      // For Super Admin, fetch the product by ID only (no store restriction)
      store_product = await this.product_repository.get_product_by_id(
        new Types.ObjectId(id),
        { name: 1, image2: 1, image1: 1, image3: 1 },
      );
    } else {
      // For Store user, fetch the product with store restriction
      store_product = await this.product_repository.get_product_by_store_id_product_id(
        new Types.ObjectId(id),
        new Types.ObjectId(store_payload._id),
        { name: 1, image2: 1, image1: 1, image3: 1 },
      );
    }

    if (!store_product) throw new BadRequestException('Product not found');

    const path = ProductService.GET_PRODUCT_IMAGE_PATH(store_payload._id);

    let product_temp: any = structuredClone(update_product_dto);
    console.log(files, 'files', update_product_dto);

    if (files?.image1?.length) {
      if (store_product.image1) {
        product_temp.image1 = (
          await this.s3_service.upload_file_by_key(
            files.image1[0],
            store_product.image1,
          )
        ).Key;
      } else {
        product_temp.image1 = (
          await this.s3_service.upload_file(files.image1[0], path)
        ).Key;
      }
    } else {
      delete product_temp.image1;
    }
    if (files?.image2?.length) {
      if (store_product.image2) {
        product_temp.image2 = (
          await this.s3_service.upload_file_by_key(
            files.image2[0],
            store_product.image2,
          )
        ).Key;
      } else {
        product_temp.image2 = (
          await this.s3_service.upload_file(files.image2[0], path)
        ).Key;
      }
    } else {
      delete product_temp.image2;
    }
    if (files?.image3?.length) {
      if (store_product.image3) {
        product_temp.image3 = (
          await this.s3_service.upload_file_by_key(
            files.image3[0],
            store_product.image3,
          )
        ).Key;
      } else {
        product_temp.image3 = (
          await this.s3_service.upload_file(files.image3[0], path)
        ).Key;
      }
    } else {
      delete product_temp.image3;
    }

    console.log(product_temp);
    const product = await this.product_repository.update_product(
      new Types.ObjectId(id),
      isSuperAdmin ? undefined : new Types.ObjectId(store_payload._id), // Pass store_id only for Store users
      product_temp,
    );
    if (!product) {
      throw new BadRequestException('Product does not exist');
    }
    if (product.image1) {
      product.image1 = await this.s3_service.get_image_url(product.image1);
    }
    if (product.image2) {
      product.image2 = await this.s3_service.get_image_url(product.image2);
    }
    if (product.image3) {
      product.image3 = await this.s3_service.get_image_url(product.image3);
    }
    return new Product(product);
  } catch (e) {
    console.log(e, 'udpate');
    throw new InternalServerErrorException(e);
  }
}

  async bulk_update_product_prices(
    discount: number,
    productIds: Types.ObjectId[]
  ): Promise<{ message: string }> {
    try {
      const bulkWriteResult = await this.product_repository.bulk_update_product_prices(
        discount,
        productIds
      );
      console.log(bulkWriteResult)
      if (bulkWriteResult.modifiedCount === 0) {
        throw new BadRequestException('No products were updated');
      }
  
      return { message: 'Product prices updated successfully' };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Failed to update product prices');
    }
  }
  
  
  async get_total_no_products_by_store_id(store: string) {
    try {
      const total =
        await this.product_repository.get_total_no_products_by_store_id({
          store: new Types.ObjectId(store),
        });
      return total;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  // async get_all_products(
  //   page_no: number,
  //   category?: string,
  //   sub_category?: string,
  //   item?: string,
  //   name?: string,
  //   minPrice?: number,
  //   maxPrice?: number,
  //   sortBy?: string,
  //   order?: 'asc' | 'desc',
  //   projection?: ProductProjection,
  // ): Promise<{ products: Product[]; total: number }> {
  //   try {
  //     const params = new PaginatedDataDto(page_no);

  //     const is_valid = await validate(params, {
  //       validationError: { target: false },
  //     });
  //     if (is_valid.length) {
  //       throw new BadRequestException('Incorrect page no value');
  //     }

  //     if (
  //       category &&
  //       sub_category &&
  //       (!isMongoId(category) || !isMongoId(sub_category))
  //     )
  //       throw new BadRequestException('invalid category or sub category!');
  //     if (item && !isMongoId(item))
  //       throw new BadRequestException('invalid item!');
  //     let filters: any = {};

  //     if (category) {
  //       filters.category = new Types.ObjectId(category);
  //     }
  //     if (sub_category) {
  //       filters.sub_category = new Types.ObjectId(sub_category);
  //     }
  //     if (item && item !== 'all') {
  //       filters.item = new Types.ObjectId(item);
  //     }
  //     if (name && name.trim() !== '') {
  //       filters.name = { $regex: new RegExp(name.trim(), 'i') };
  //     }
  //     const parsedMin = Number(minPrice);
  //     const parsedMax = Number(maxPrice);

  //     if (!isNaN(parsedMin) || !isNaN(parsedMax)) {
  //       const priceFilter: any = {};

  //       if (!isNaN(parsedMin)) {
  //         priceFilter.$gte = parsedMin;
  //       }
  //       if (!isNaN(parsedMax)) {
  //         priceFilter.$lte = parsedMax;
  //       }

  //       filters.$or = [
  //         { discounted_price: priceFilter },
  //         {
  //           $and: [
  //             { discounted_price: { $exists: false } },
  //             { base_price: priceFilter },
  //           ],
  //         },
  //       ];
  //     }
  //     console.log(filters);
  //     const products_res = await this.product_repository.get_all_products(
  //       page_no,
  //       projection,
  //       filters,
  //     );

  //     const products = await Promise.all(
  //       products_res.map(async (prod) => {
  //         if (prod.image1) {
  //           prod.image1 = await this.s3_service.get_image_url(prod.image1);
  //         }
  //         if (prod.image2) {
  //           prod.image2 = await this.s3_service.get_image_url(prod.image2);
  //         }
  //         if (prod.image3) {
  //           prod.image3 = await this.s3_service.get_image_url(prod.image3);
  //         }

  //         return prod;
  //       }),
  //     );

  //     if (sortBy === 'price') {
  //       products.sort((a, b) => {
  //         const priceA = a.discounted_price ?? a.base_price ?? 0;
  //         const priceB = b.discounted_price ?? b.base_price ?? 0;
  //         return order === 'desc' ? priceB - priceA : priceA - priceB;
  //       });
  //     }

  //     const total =
  //       await this.product_repository.get_total_no_products_by_store_id({
  //         ...filters,
  //       });

  //     return { products: products.map((prod) => new Product(prod)), total };
  //   } catch (e) {
  //     console.log(e);
  //     throw new InternalServerErrorException(e);
  //   }
  // }
  async get_all_products(
  page_no: number,
  category?: string,
  sub_category?: string,
  item?: string,
  name?: string,
  minPrice?: number,
  maxPrice?: number,
  sortBy?: string,
  order?: 'asc' | 'desc',
  projection?: ProductProjection,
): Promise<{ products: Product[]; total: number }> {
  try {
    const params = new PaginatedDataDto(page_no);

    const is_valid = await validate(params, {
      validationError: { target: false },
    });
    if (is_valid.length) {
      throw new BadRequestException('Incorrect page no value');
    }

    if (
      category &&
      sub_category &&
      (!isMongoId(category) || !isMongoId(sub_category))
    )
      throw new BadRequestException('invalid category or sub category!');
    if (item && !isMongoId(item))
      throw new BadRequestException('invalid item!');
    let filters: any = {};

    if (category) {
      filters.category = new Types.ObjectId(category);
    }
    if (sub_category) {
      filters.sub_category = new Types.ObjectId(sub_category);
    }
    if (item && item !== 'all') {
      filters.item = new Types.ObjectId(item);
    }
    if (name && name.trim() !== '') {
      filters.name = { $regex: new RegExp(name.trim(), 'i') };
    }
    const parsedMin = Number(minPrice);
    const parsedMax = Number(maxPrice);

    if (!isNaN(parsedMin) || !isNaN(parsedMax)) {
      const priceFilter: any = {};

      if (!isNaN(parsedMin)) {
        priceFilter.$gte = parsedMin;
      }
      if (!isNaN(parsedMax)) {
        priceFilter.$lte = parsedMax;
      }

      filters.$or = [
        { discounted_price: priceFilter },
        {
          $and: [
            { discounted_price: { $exists: false } },
            { base_price: priceFilter },
          ],
        },
      ];
    }
    console.log(filters);

    const products_res = await this.product_repository.get_all_products(
      page_no,
      projection,
      filters,
      sortBy, // Pass sortBy to repository
      order,  // Pass order to repository
    );

    const products = await Promise.all(
      products_res.map(async (prod) => {
        if (prod.image1) {
          prod.image1 = await this.s3_service.get_image_url(prod.image1);
        }
        if (prod.image2) {
          prod.image2 = await this.s3_service.get_image_url(prod.image2);
        }
        if (prod.image3) {
          prod.image3 = await this.s3_service.get_image_url(prod.image3);
        }
        return prod;
      }),
    );

    // Removed client-side sorting for price, as it's now handled in the repository

    const total =
      await this.product_repository.get_total_no_products_by_store_id({
        ...filters,
      });

    return { products: products.map((prod) => new Product(prod)), total };
  } catch (e) {
    console.log(e);
    throw new InternalServerErrorException(e);
  }
}

  async get_product_by_id(
    id: string,
    projection?: ProductProjection,
  ): Promise<Product> {
    try {
      const product = await this.product_repository.get_product_by_id(
        new Types.ObjectId(id),
        projection,
      );

      if (!product) {
        throw new BadRequestException('Product doesnot exist');
      }
      if (product.image1) {
        product.image1 = await this.s3_service.get_image_url(product.image1);
      }
      if (product.image2) {
        product.image2 = await this.s3_service.get_image_url(product.image2);
      }
      if (product.image3) {
        product.image3 = await this.s3_service.get_image_url(product.image3);
      }

      return new Product(product);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
async submit_product_rating(
  product_id: string,
  user_id: string,
  rating_dto: SubmitRatingDto,
): Promise<Product> {
  try {
    const productId = new Types.ObjectId(product_id);
    const userId = new Types.ObjectId(user_id);

    // Check if user already rated
    const existingRating = await this.rating_repository.get_user_rating(productId, userId);
    if (existingRating) {
      throw new BadRequestException('You have already rated this product');
    }

    // Save rating
    await this.rating_repository.create_rating({
      productId,
      userId,
      rating: rating_dto.rating,
    });

    // Update product rating stats
    const stats = await this.rating_repository.get_rating_stats(productId);
    const update = {
      $set: {
        average_rating: stats.average_rating,
        total_ratings: stats.total_ratings,
        rating_distribution: stats.rating_distribution,
      },
    };

    const updatedProduct = await this.product_repository.update_product_rating(
      productId,
      update,
    );

    if (!updatedProduct) {
      throw new BadRequestException('Failed to update rating');
    }

    return new Product(updatedProduct);
  } catch (e) {
    console.error(e);
    // Cast e to Error to safely access message
    const errorMessage = e instanceof Error ? e.message : 'Failed to submit rating';
    throw new InternalServerErrorException(errorMessage);
  }
}

  async get_product_rating(product_id: string): Promise<{
    average_rating: number;
    total_ratings: number;
    rating_distribution: {
      five: number;
      four: number;
      three: number;
      two: number;
      one: number;
    };
  }> {
    try {
      const stats = await this.rating_repository.get_rating_stats(new Types.ObjectId(product_id));
      return stats;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Failed to retrieve rating');
    }
  }

  async get_user_rating(product_id: string, user_id: string): Promise<number | null> {
    try {
      const rating = await this.rating_repository.get_user_rating(
        new Types.ObjectId(product_id),
        new Types.ObjectId(user_id),
      );
      return rating ? rating.rating : null;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Failed to retrieve user rating');
    }
  }

  async get_product_ratings(product_id: string): Promise<
    Array<{
      _id: string;
      rating: number;
      customer: { name: string; email: string };
      createdAt: Date;
    }>
  > {
    try {
      const ratings = await this.rating_repository.get_product_ratings(new Types.ObjectId(product_id));
      return ratings.map((rating) => ({
        _id: rating._id.toString(),
        rating: rating.rating,
        customer: {
          name: (rating.userId as any).name,
          email: (rating.userId as any).email,
        },
        createdAt: rating.createdAt,
      }));
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Failed to retrieve product ratings');
    }
  }

async update_product_rating(rating_id: string, rating: number): Promise<Product> {
  try {
    const ratingObj = await this.rating_repository.update_rating(
      new Types.ObjectId(rating_id),
      rating,
    );
    if (!ratingObj) {
      throw new BadRequestException('Rating not found');
    }

    const stats = await this.rating_repository.get_rating_stats(ratingObj.productId);
    const update = {
      $set: {
        average_rating: stats.average_rating,
        total_ratings: stats.total_ratings,
        rating_distribution: stats.rating_distribution,
      },
    };

    const updatedProduct = await this.product_repository.update_product_rating(
      ratingObj.productId,
      update,
    );

    if (!updatedProduct) {
      throw new BadRequestException('Failed to update product rating');
    }

    return new Product(updatedProduct);
  } catch (e) {
    console.error(e);
    throw new InternalServerErrorException('Failed to update rating');
  }
}
  async get_all_products_for_admin(
    page_no: number,
    category?: string,
    sub_category?: string,
    item?: string,
    store?: string,
    name?: string,
    projection?: ProductProjection,
  ): Promise<{ products: Product[]; total: number }> {
    try {
      const params = new PaginatedDataDto(page_no);

      const is_valid = await validate(params, {
        validationError: { target: false },
      });
      if (is_valid.length) {
        throw new BadRequestException('Incorrect page no value');
      }

      if (
        category &&
        sub_category &&
        (!isMongoId(category) || !isMongoId(sub_category))
      ) {
        throw new BadRequestException('invalid category or sub category!');
      }

      let filters: FilterQuery<Product> = {};

      if (category) {
        filters.category = new Types.ObjectId(category);
      }
      if (sub_category) {
        filters.sub_category = new Types.ObjectId(sub_category);
      }
      if (item && item !== 'all') {
        filters.item = new Types.ObjectId(item);
      }
      if (store && isMongoId(store)) {
        filters.store = new Types.ObjectId(store);
      }
      if (name) {
        filters.name = { $regex: name, $options: 'i' };
      }

      const products_res = await this.product_repository.get_all_store_products(
        page_no,
        projection,
        filters,
      );

      if (!products_res) {
        throw new BadRequestException('No products found');
      }

      const products = await Promise.all(
        products_res.map(async (prod) => {
          if (prod.image1) {
            prod.image1 = await this.s3_service.get_image_url(prod.image1);
          }
          if (prod.image2) {
            prod.image2 = await this.s3_service.get_image_url(prod.image2);
          }
          if (prod.image3) {
            prod.image3 = await this.s3_service.get_image_url(prod.image3);
          }
          return prod;
        }),
      );

      const total = await this.product_repository.get_total_no_products_by_store_id({
        ...filters,
      });

      return { products: products.map((prod) => new Product(prod)), total };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }
  async get_store_product_count(store_payload: AuthPayload): Promise<number> {
  try {
    const count = await this.product_repository.get_store_product_count(
      new Types.ObjectId(store_payload._id)
    );
    return count;
  } catch (e) {
    console.error(e);
    throw new InternalServerErrorException('Failed to retrieve store product count');
  }
}

// async get_all_rated_products(
//   page_no: number,
//   page_size: number,
// ): Promise<{ products: any[]; total: number }> {
//   try {
//     const params = new PaginatedDataDto(page_no);

//     const is_valid = await validate(params, {
//       validationError: { target: false },
//     });
//     if (is_valid.length) {
//       throw new BadRequestException('Incorrect page number value');
//     }

//     if (page_size < 1) {
//       throw new BadRequestException('Page size must be at least 1');
//     }

//     const skip = (page_no - 1) * page_size;
//     const pipeline = [
//       {
//         $lookup: {
//           from: 'ratings',
//           localField: '_id',
//           foreignField: 'productId',
//           as: 'ratings',
//         },
//       },
//       {
//         $match: {
//           'ratings.0': { $exists: true },
//         },
//       },
//       {
//         $unwind: '$ratings',
//       },
//       {
//         $lookup: {
//           from: 'customers',
//           localField: 'ratings.userId',
//           foreignField: '_id',
//           as: 'ratings.customer',
//         },
//       },
//       {
//         $unwind: '$ratings.customer',
//       },
//       {
//         $sort: {
//           'ratings.createdAt': -1, // Sort by createdAt only in descending order
//         },
//       },
//       {
//         $group: {
//           _id: '$_id',
//           productName: { $first: '$name' },
//           image1: { $first: '$image1' },
//           image2: { $first: '$image2' },
//           image3: { $first: '$image3' },
//           ratings: {
//             $push: {
//               _id: { $toString: '$ratings._id' },
//               rating: '$ratings.rating',
//               customer: {
//                 name: '$ratings.customer.name',
//                 email: '$ratings.customer.email',
//               },
//               createdAt: '$ratings.createdAt',
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           productId: { $toString: '$_id' },
//           productName: 1,
//           image1: 1,
//           image2: 1,
//           image3: 1,
//           ratings: 1,
//         },
//       },
//       { $skip: skip },
//       { $limit: page_size },
//     ];

//     const products = await this.product_repository.get_all_rated_products(pipeline);
//     const totalPipeline = [
//       {
//         $lookup: {
//           from: 'ratings',
//           localField: '_id',
//           foreignField: 'productId',
//           as: 'ratings',
//         },
//       },
//       {
//         $match: {
//           'ratings.0': { $exists: true },
//         },
//       },
//       {
//         $unwind: '$ratings',
//       },
//       {
//         $count: 'total',
//       },
//     ];
//     const totalResult = await this.product_repository.get_all_rated_products(totalPipeline);
//     const total = totalResult[0]?.total || 0;

//     const productsWithUrls = await Promise.all(
//       products.map(async (prod) => {
//         if (prod.image1) prod.image1 = await this.s3_service.get_image_url(prod.image1);
//         if (prod.image2) prod.image2 = await this.s3_service.get_image_url(prod.image2);
//         if (prod.image3) prod.image3 = await this.s3_service.get_image_url(prod.image3);
//         return prod;
//       }),
//     );

//     return { products: productsWithUrls, total };
//   } catch (e) {
//     console.log(e);
//     throw new InternalServerErrorException(e);
//   }
// }
async get_all_rated_products(
  page_no: number,
  page_size: number,
): Promise<{ products: any[]; total: number }> {
  try {
    const params = new PaginatedDataDto(page_no);

    const is_valid = await validate(params, {
      validationError: { target: false },
    });
    if (is_valid.length) {
      throw new BadRequestException('Incorrect page number value');
    }

    if (page_size < 1) {
      throw new BadRequestException('Page size must be at least 1');
    }

    const skip = (page_no - 1) * page_size;
    const pipeline = [
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'productId',
          as: 'ratings',
        },
      },
      {
        $match: {
          'ratings.0': { $exists: true },
        },
      },
      {
        $unwind: '$ratings',
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'ratings.userId',
          foreignField: '_id',
          as: 'ratings.customer',
        },
      },
      {
        $unwind: '$ratings.customer',
      },
      {
        $sort: {
          'ratings.createdAt': -1,
          '_id': -1, // Add secondary sort for stability
        },
      },
      // Move skip and limit before grouping
      { $skip: skip },
      { $limit: page_size },
      {
        $group: {
          _id: '$_id',
          productName: { $first: '$name' },
          image1: { $first: '$image1' },
          image2: { $first: '$image2' },
          image3: { $first: '$image3' },
          ratings: {
            $push: {
              _id: { $toString: '$ratings._id' },
              rating: '$ratings.rating',
              customer: {
                name: '$ratings.customer.name',
                email: '$ratings.customer.email',
              },
              createdAt: '$ratings.createdAt',
            },
          },
        },
      },
      {
        $project: {
          productId: { $toString: '$_id' },
          productName: 1,
          image1: 1,
          image2: 1,
          image3: 1,
          ratings: 1,
        },
      },
    ];

    console.log('Executing get_all_rated_products pipeline:', JSON.stringify(pipeline, null, 2)); // Debug pipeline
    const products = await this.product_repository.get_all_rated_products(pipeline);
    console.log('Pipeline result:', products); // Debug pipeline output

    const totalPipeline = [
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'productId',
          as: 'ratings',
        },
      },
      {
        $match: {
          'ratings.0': { $exists: true },
        },
      },
      {
        $unwind: '$ratings',
      },
      {
        $count: 'total',
      },
    ];

    const totalResult = await this.product_repository.get_all_rated_products(totalPipeline);
    const total = totalResult[0]?.total || 0;
    console.log('Total Result:', totalResult, 'Total:', total); // Debug total count

    const productsWithUrls = await Promise.all(
      products.map(async (prod) => {
        if (prod.image1) prod.image1 = await this.s3_service.get_image_url(prod.image1);
        if (prod.image2) prod.image2 = await this.s3_service.get_image_url(prod.image2);
        if (prod.image3) prod.image3 = await this.s3_service.get_image_url(prod.image3);
        return prod;
      }),
    );

    return { products: productsWithUrls, total };
  } catch (e) {
    console.error('Error in get_all_rated_products:', e);
    throw new InternalServerErrorException(e);
  }
}

async get_store_rated_products(
  store_payload: AuthPayload,
  page_no: number,
  page_size: number,
): Promise<{ products: any[]; total: number }> {
  try {
    const params = new PaginatedDataDto(page_no);

    const is_valid = await validate(params, {
      validationError: { target: false },
    });
    if (is_valid.length) {
      throw new BadRequestException('Incorrect page number value');
    }

    if (page_size < 1) {
      throw new BadRequestException('Page size must be at least 1');
    }

    const skip = (page_no - 1) * page_size;

    const pipeline = [
      {
        $match: {
          store: new Types.ObjectId(store_payload._id),
        },
      },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'productId',
          as: 'ratings',
        },
      },
      {
        $match: {
          'ratings.0': { $exists: true },
        },
      },
      {
        $unwind: '$ratings',
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'ratings.userId',
          foreignField: '_id',
          as: 'ratings.customer',
        },
      },
      {
        $unwind: '$ratings.customer',
      },
      {
        $sort: {
          'ratings.createdAt': -1,
          '_id': -1, // Add secondary sort for stability
        },
      },
      // Move skip and limit before grouping
      { $skip: skip },
      { $limit: page_size },
      {
        $group: {
          _id: '$_id',
          productName: { $first: '$name' },
          image1: { $first: '$image1' },
          image2: { $first: '$image2' },
          image3: { $first: '$image3' },
          ratings: {
            $push: {
              _id: { $toString: '$ratings._id' },
              rating: '$ratings.rating',
              customer: {
                name: '$ratings.customer.name',
                email: '$ratings.customer.email',
              },
              createdAt: '$ratings.createdAt',
            },
          },
        },
      },
      {
        $project: {
          productId: { $toString: '$_id' },
          productName: 1,
          image1: 1,
          image2: 1,
          image3: 1,
          ratings: 1,
        },
      },
    ];

    console.log('Executing pipeline:', JSON.stringify(pipeline, null, 2)); // Debug pipeline
    const products = await this.product_repository.get_all_rated_products(pipeline);
    console.log('Pipeline result:', products); // Debug pipeline output

    const totalPipeline = [
      {
        $match: {
          store: new Types.ObjectId(store_payload._id),
        },
      },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'productId',
          as: 'ratings',
        },
      },
      {
        $match: {
          'ratings.0': { $exists: true },
        },
      },
      {
        $unwind: '$ratings',
      },
      {
        $count: 'total',
      },
    ];

    const totalResult = await this.product_repository.get_all_rated_products(totalPipeline);
    const total = totalResult[0]?.total || 0;
    console.log('Total Result:', totalResult, 'Total:', total); // Debug total count

    const productsWithUrls = await Promise.all(
      products.map(async (prod) => {
        if (prod.image1) prod.image1 = await this.s3_service.get_image_url(prod.image1);
        if (prod.image2) prod.image2 = await this.s3_service.get_image_url(prod.image2);
        if (prod.image3) prod.image3 = await this.s3_service.get_image_url(prod.image3);
        return prod;
      }),
    );

    return { products: productsWithUrls, total };
  } catch (e) {
    console.error('Error in get_store_rated_products:', e);
    throw new InternalServerErrorException(e);
  }
}
}