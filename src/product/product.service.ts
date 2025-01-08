import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import {
    Product,
    ProductProjection,
    UpdateProductDto,
} from 'src/schemas/ecommerce/product.schema';
import { ProductRepository } from './product.repository';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { Types } from 'mongoose';
import { PaginatedDataDto } from 'src/commons/dtos/request_dtos/pagination.dto';
import { validate } from 'class-validator';
import { DeleteResponse } from 'src/commons/dtos/response_dtos/delete.dto';
import { S3Service } from 'src/aws/s3.service';
import { CreateProductDto } from './dtos/request_dtos/product.dto';

@Injectable()
export class ProductService {
    constructor(private product_repository: ProductRepository, private s3_service: S3Service) { }

    private static readonly GET_PRODUCT_IMAGE_PATH = (id: string) => {
        return "glimmer/brands/" + id + "/product_images"
    }

    async create_product(
        product_dto: CreateProductDto,
        store_payload: AuthPayload,
        images: Array<Express.Multer.File>
    ): Promise<Product> {
        try {

            const path = ProductService.GET_PRODUCT_IMAGE_PATH(store_payload._id)
            const images_keys = await this.s3_service.upload_many_files(images, path)


            let product_temp: any = structuredClone(product_dto)
            product_temp.store = new Types.ObjectId(store_payload._id);
            product_temp.images = images_keys.map((k, idx) => ({ id: idx, image_key: k }))

            const product = await this.product_repository.create_product(product_dto);

            product.images = await this.s3_service.get_image_urls(images_keys)

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

            if (product.images?.length) {
                const images_res = product.images.map(async (img) => {
                    return {
                        id: img.id,
                        image: await this.s3_service.get_image_url(img.image)
                    }
                })
                const images = await Promise.all(images_res)
                product.images = images
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
        projection?: ProductProjection,
    ): Promise<Product[]> {
        try {
            const params = new PaginatedDataDto(page_no);

            const is_valid = await validate(params, {
                validationError: { target: false },
            });
            if (is_valid.length) {
                throw new BadRequestException('Incorrect page no value');
            }

            const products_res = await this.product_repository.get_all_store_products(
                new Types.ObjectId(store_payload._id),
                page_no,
                projection,
            );

            if (!products_res) {
                throw new BadRequestException('Product doesnot exist');
            }

            const products = await Promise.all(products_res.map(async (prod) => {
            if (prod.images?.length) {
                const images_res = prod.images.map(async (img) => {
                    return {
                        id: img.id,
                        image: await this.s3_service.get_image_url(img.image)
                    }
                })
                const images = await Promise.all(images_res)
                product.images = images
            }
                return prod
            }))

            return products.map((prod) => new Product(prod));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }

    async update_store_product(
        id: string,
        store_payload: AuthPayload,
        update_product_dto: UpdateProductDto,
    ): Promise<Product> {
        try {
            const product = await this.product_repository.update_product(
                new Types.ObjectId(id),
                new Types.ObjectId(store_payload._id),
                update_product_dto,
            );
            if (!product) {
                throw new BadRequestException('Product doesnot exist');
            }
            if (product.images?.length) {
                product.images = await this.s3_service.get_image_urls(product.images)
            }

            return new Product(product);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }
}
