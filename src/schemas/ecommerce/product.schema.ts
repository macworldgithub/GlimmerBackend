// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProductStatus } from 'src/product/enums/product_status.enum';
import * as mongoose from 'mongoose';
import {  PartialType } from '@nestjs/swagger';
import { CreateProductDto } from 'src/product/dtos/request_dtos/product.dto';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
    // mongo-schema-decorators
    @Prop({ required: true })
    name: string;

    // mongo-schema-decorators
    @Prop({ required: true })
    quantity: number;

    // mongo-schema-decorators
    @Prop({ required: false, default: null })
    description?: string;

    // mongo-schema-decorators
    @Prop({ required: false, default: "" })
    image1?: string

    // mongo-schema-decorators
    @Prop({ required: false, default: "" })
    image2?: string

    // mongo-schema-decorators
    @Prop({ required: false, default: "" })
    image3?: string

    // mongo-schema-decorators
    @Prop({ required: true })
    base_price: number;

    // mongo-schema-decorators
    @Prop({ required: true })
    discounted_price: number;

    // mongo-schema-decorators
    @Prop({ required: true, type: String })
    status: ProductStatus;

    // mongo-schema-decorators
    @Prop({ required: false, type: Date, default: new Date() })
    created_at: Date;

    // mongo-schema-decorators
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Store' })
    store: Types.ObjectId;

    constructor(product: Product) {
        if (!product) return;
        this._id = product._id?.toString();
        this.name = product.name;
        this.store = product.store?.toString();
        this.status = product.status;
        this.image1 = product.image1;
        this.image2 = product.image2;
        this.image3 = product.image3;
        this.quantity = product.quantity;
        this.base_price = product.base_price;
        this.created_at = product.created_at;
        this.description = product.description;
        this.discounted_price = product.discounted_price;
    }
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type ProductProjection = {
    [key in keyof Product]?: 0 | 1;
};


