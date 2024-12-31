import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProductStatus } from 'src/product/enums/product_status.enum';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
    @Prop()
    name: string;

    @Prop()
    quantity: string;


    @Prop()
    description: string;

    @Prop()
    images: string[];


    @Prop()
    base_price: number

    @Prop()
    discounted_price: number

    @Prop([ProductStatus])
    status: ProductStatus


    @Prop([Date])
    created_at: Date;

}

export const ProductSchema = SchemaFactory.createForClass(Product);

