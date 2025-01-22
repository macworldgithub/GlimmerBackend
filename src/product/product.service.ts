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
import { Types } from 'mongoose';
import { PaginatedDataDto } from 'src/commons/dtos/request_dtos/pagination.dto';
import { isMongoId, validate } from 'class-validator';
import { DeleteResponse } from 'src/commons/dtos/response_dtos/delete.dto';
import { S3Service } from 'src/aws/s3.service';
import {
  CreateProductDto,
  UpdateProductDto,
} from './dtos/request_dtos/product.dto';
import { ProductFiles } from './types/update_product.type';
import { ProductSubCategoryRepository } from 'src/product_sub_category/product_sub_category.repository';

@Injectable()
export class ProductService {
  constructor(
    private product_repository: ProductRepository,
    private sub_category_repository: ProductSubCategoryRepository,
    private s3_service: S3Service,
  ) {}

  private static readonly GET_PRODUCT_IMAGE_PATH = (id: string) => {
    return 'glimmer/brands/' + id + '/product_images';
  };

  async create_product(
    product_dto: CreateProductDto,
    store_payload: AuthPayload,
  ) {
    try {
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
    store_payload: AuthPayload,
  ): Promise<DeleteResponse> {
    try {
      const product =
        await this.product_repository.delete_product_by_store_id_product_id(
          new Types.ObjectId(id),
          new Types.ObjectId(store_payload._id),
        );

      if (!product.deletedCount) {
        throw new BadRequestException('Product doesnot exist');
      }

      return { ...product, message: 'success' };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async get_all_store_products(
    store_payload: AuthPayload,
    page_no: number,
    category?: string,
    sub_category?: string,
    item?: string,
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
      let filters: Partial<Product> = {};

      if (category) {
        filters.category = new Types.ObjectId(category);
      }
      if (sub_category) {
        filters.sub_category = new Types.ObjectId(sub_category);
      }
      if (item && item !== "all"){
          filters.item = new Types.ObjectId(item)
      }

      const products_res = await this.product_repository.get_all_store_products(
        new Types.ObjectId(store_payload._id),
        page_no,
        projection,
        filters,
      );

      if (!products_res) {
        throw new BadRequestException('Product doesnot exist');
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

      const total =
        await this.product_repository.get_total_no_products_by_store_id({
          store: new Types.ObjectId(store_payload._id),
          ...filters,
        });

      return { products: products.map((prod) => new Product(prod)), total };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async update_store_product(
    id: string,
    store_payload: AuthPayload,
    update_product_dto: UpdateProductDto,
    files: ProductFiles,
  ): Promise<Product> {
    try {
      const store_product =
        await this.product_repository.get_product_by_store_id_product_id(
          new Types.ObjectId(id),
          new Types.ObjectId(store_payload._id),
          { name: 1, image2: 1, image1: 1, image3: 1 },
        );
      if (!store_product) throw new BadRequestException('Product not found');

      const path = ProductService.GET_PRODUCT_IMAGE_PATH(store_payload._id);

      let product_temp: any = structuredClone(update_product_dto);
      console.log(files);

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
        new Types.ObjectId(store_payload._id),
        product_temp,
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
        console.log(e,"udpate")
      throw new InternalServerErrorException(e);
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

  async get_all_products(
    page_no: number,
    category?: string,
    sub_category?: string,
    item?: string,
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
      if (
        item &&
        (!isMongoId(item)) 
      )
        throw new BadRequestException('invalid item!');
      let filters: Partial<Product> = {};

      if (category) {
        filters.category = new Types.ObjectId(category);
      }
      if (sub_category) {
        filters.sub_category = new Types.ObjectId(sub_category);
      }
      if (item && item !== "all"){
          filters.item = new Types.ObjectId(item)
      }

      console.log(filters)
      const products_res = await this.product_repository.get_all_products(
        page_no,
        projection,
        filters,
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
      const product =
        await this.product_repository.get_product_by_id(
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

}
