import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Product, ProductProjection } from 'src/schemas/ecommerce/product.schema';
import { ProductRepository } from './product.repository';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { Types } from 'mongoose';
import { PaginatedDataDto } from 'src/commons/dtos/request_dtos/pagination.dto';

@Injectable()
export class ProductService {
    constructor(private product_repository: ProductRepository) { }


    async create_product(product_dto: Product, store_payload: AuthPayload): Promise<Product> {
        try {

            product_dto.store = new Types.ObjectId(store_payload._id)
            const product = await this.product_repository.create_product(product_dto)

            return new Product(product)

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }


    async get_store_product_by_id(id: string, store_payload: AuthPayload, projection?: ProductProjection): Promise<Product> {
        try {

            const product = await this.product_repository.get_product_by_store_id_product_id(new Types.ObjectId(id), new Types.ObjectId(store_payload._id), projection)

            if (!product) {
                throw new BadRequestException("Product doesnot exist")
            }

            return new Product(product)

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }


    async get_all_store_products(store_payload: AuthPayload, page_no: number, projection?: ProductProjection): Promise<Product[]> {
        try {

            const filters = new PaginatedDataDto(page_no)

            const is_valid = await validate(filters, {
                validationError: { target: false },
            })
            if (is_valid.length) {
                throw new BadRequestException({
                    message: Object.values(is_valid[0]?.constraints || {})[0] || 'incorrect attributes',
                })
            }

            const products = await this.product_repository.get_all_store_products(new Types.ObjectId(store_payload._id), page_no, projection)

            if (!products) {
                throw new BadRequestException("Product doesnot exist")
            }

            return products

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

}


