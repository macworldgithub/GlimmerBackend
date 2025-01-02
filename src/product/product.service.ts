import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Product, ProductProjection, UpdateProductDto } from 'src/schemas/ecommerce/product.schema';
import { ProductRepository } from './product.repository';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { Types } from 'mongoose';
import { PaginatedDataDto } from 'src/commons/dtos/request_dtos/pagination.dto';
import { validate } from 'class-validator';
import { DeleteResponse } from 'src/commons/dtos/response_dtos/delete.dto';

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


    async delete_store_product_by_id(id: string, store_payload: AuthPayload): Promise<DeleteResponse> {
        try {

            const product = await this.product_repository.delete_product_by_store_id_product_id(new Types.ObjectId(id), new Types.ObjectId(store_payload._id))

            if (!product.deletedCount) {
                throw new BadRequestException("Product doesnot exist")
            }

            return { ...product, message: "success" }

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }


    async get_all_store_products(store_payload: AuthPayload, page_no: number, projection?: ProductProjection): Promise<Product[]> {
        try {

            const params = new PaginatedDataDto(page_no)

            const is_valid = await validate(params, {
                validationError: { target: false },
            })
            if (is_valid.length) {
                throw new BadRequestException("Incorrect page no value")
            }

            const products = await this.product_repository.get_all_store_products(new Types.ObjectId(store_payload._id), page_no, projection)

            if (!products) {
                throw new BadRequestException("Product doesnot exist")
            }

            return products.map(prod => new Product(prod))

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async update_store_product(id: string, store_payload: AuthPayload, update_product_dto: UpdateProductDto): Promise<Product> {
        try {

            const product = await this.product_repository.update_product(new Types.ObjectId(id), new Types.ObjectId(store_payload._id), update_product_dto)
            if (!product) {
                throw new BadRequestException("Product doesnot exist")
            }

            return new Product(product)

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

}


