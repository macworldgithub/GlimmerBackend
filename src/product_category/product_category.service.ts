import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductCategoryRepository } from './product_category.repository';
import { CreateProductCategoryDto } from './dtos/req_dtos/product_category.dto';

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
}
