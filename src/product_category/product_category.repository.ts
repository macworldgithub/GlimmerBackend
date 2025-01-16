import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProductCategory } from "src/schemas/ecommerce/product_category.schema";
import { CreateProductCategoryDto } from "./dtos/req_dtos/product_category.dto";

@Injectable()
export class ProductCategoryRepository {
    constructor(
        @InjectModel(ProductCategory.name) private product_category_model: Model<ProductCategory>,
    ) { }

    async create_product_category(create_cat: CreateProductCategoryDto) {
        const product_cat = new this.product_category_model(create_cat);
        return product_cat.save();
    }

}
