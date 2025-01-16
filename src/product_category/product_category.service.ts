import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductCategoryRepository } from './product_category.repository';
import { CreateProductCategoryDto, UpdateProductCategoryDto } from './dtos/req_dtos/product_category.dto';
import { Types } from "mongoose"

@Injectable()
export class ProductCategoryService {
    constructor(private product_category_repository: ProductCategoryRepository) { }

    async create_product_cateogry(create_cat: CreateProductCategoryDto) {
        try {
            return this.product_category_repository.create_product_category(create_cat)
        } catch (e) {
            console.log(e)
            throw new InternalServerErrorException(e)
        }
    }


    async update_product_cateogry(update_cat: UpdateProductCategoryDto, id: string) {
        try {
            return this.product_category_repository.update_product_category(update_cat, new Types.ObjectId(id))
        } catch (e) {
            console.log(e)
            throw new InternalServerErrorException(e)
        }
    }


    async get_all_categories() {
        try {
            return this.product_category_repository.get_all_categories()
        } catch (e) {
            console.log(e)
            throw new InternalServerErrorException(e)
        }
    }

}
