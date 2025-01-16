import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Types } from "mongoose"
import { CreateProductSubCategoryDto, UpdateProductSubCategoryDto } from "./dtos/req_dtos/product_sub_category.dto";
import { ProductSubCategory } from "src/schemas/ecommerce/product_sub_category.schema";

@Injectable()
export class ProductSubCategoryRepository {
    constructor(
        @InjectModel(ProductSubCategory.name) private product_sub_category_model: Model<ProductSubCategory>,
    ) { }

    async create_product_sub_category(create_sub_cat: CreateProductSubCategoryDto) {
        const product_cat = new this.product_sub_category_model(create_sub_cat);
        return product_cat.save();
    }

    async update_product_sub_category(update_sub_cat: UpdateProductSubCategoryDto, id: Types.ObjectId) {
        return this.product_sub_category_model
            .findByIdAndUpdate(
                { _id: id },
                update_sub_cat,
                { new: true, runValidators: true }, // `new: true` ensures we get the updated document
            )
            .exec();
    }

    async get_all_categories() {
        return this.product_sub_category_model
            .find(
                {}
            )
            .exec();
    }

}
