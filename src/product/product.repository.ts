import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/schemas/ecommerce/product.schema';

@Injectable()
export class ProductRepository{
    constructor(@InjectModel(Product.name) private product_model: Model<Product>) {}

    async create_product(product_dto: Product){
        const product = new this.product_model(product_dto)
        console.log(product)

        return product.save()
    }


    async get_product_by_id(){
    }

}
