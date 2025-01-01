import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Product } from 'src/schemas/ecommerce/product.schema';
import { ProductRepository } from './product.repository';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { Types } from 'mongoose';

@Injectable()
export class ProductService {
    constructor(private product_repository: ProductRepository) { }


    async create_product(product_dto: Product, store_payload: AuthPayload) {
        try {

            product_dto.store = new Types.ObjectId(store_payload._id)
            const product = await this.product_repository.create_product(product_dto)

            return product

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
