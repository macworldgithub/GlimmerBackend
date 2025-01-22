import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductCategoryRepository } from './product_category.repository';
import {
    CreateProductCategoryDto,
    UpdateProductCategoryDto,
} from './dtos/req_dtos/product_category.dto';
import { Connection, Types } from 'mongoose';
import { ProductSubCategoryRepository } from 'src/product_sub_category/product_sub_category.repository';
import { InjectConnection } from '@nestjs/mongoose';
import { ProductItemRepository } from 'src/product_item/product_item.repository';

@Injectable()
export class ProductCategoryService {
    constructor(
        private product_category_repository: ProductCategoryRepository,
        private product_sub_category_repository: ProductSubCategoryRepository,
        private product_item_repository: ProductItemRepository,
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async create_product_cateogry(create_cat: CreateProductCategoryDto) {
        try {
            return this.product_category_repository.create_product_category(
                create_cat,
            );
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async update_product_cateogry(
        update_cat: UpdateProductCategoryDto,
        id: string,
    ) {
        try {
            return this.product_category_repository.update_product_category(
                update_cat,
                new Types.ObjectId(id),
            );
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async get_all_categories() {
        try {
            return this.product_category_repository.get_all_categories();
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async delete_product_category(id: string) {
        const session = await this.connection.startSession();
        try {
            session.startTransaction();

            const res =
                await this.product_category_repository.delete_product_category(
                    new Types.ObjectId(id),
                    session,
                );
            await this.product_sub_category_repository.delete_sub_category_by_category_id(
                new Types.ObjectId(id),
                session,
            );
            await this.product_item_repository.delete_item_by_sub_category_id(
                new Types.ObjectId(id),
                session,
            );

            await session.commitTransaction();

            return res;
        } catch (e) {
            console.log(e);
            await session.endSession();
            throw new InternalServerErrorException(e);
        } finally {
            await session.endSession();
        }
    }
}
