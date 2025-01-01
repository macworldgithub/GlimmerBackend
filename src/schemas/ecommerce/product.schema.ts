// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { ProductStatus } from 'src/product/enums/product_status.enum';
import { Store } from './store.schema';
import * as mongoose from "mongoose"
import { ApiHideProperty, PartialType } from '@nestjs/swagger';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
    // req-dto-decorators
    @IsString()
    // mongo-schema-decorators
    @Prop({ required: true })
    name: string;

    // req-dto-decorators
    @IsInt()
    @Min(1)
    @Max(Infinity)
    // mongo-schema-decorators
    @Prop({ required: true })
    quantity: number;


    // req-dto-decorators
    @IsString()
    @IsOptional()
    // mongo-schema-decorators
    @Prop({ required: false, default: null })
    description?: string;

    // req-dto-decorators
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    @IsString({ each: true })
    // mongo-schema-decorators
    @Prop({ required: false, default: [] })
    images?: string[];


    // req-dto-decorators
    @IsNumber()
    @Min(0)
    @Max(Infinity)
    // mongo-schema-decorators
    @Prop({ required: true })
    base_price: number

    // req-dto-decorators
    @IsNumber()
    @Min(0)
    @Max(Infinity)
    // mongo-schema-decorators
    @Prop({ required: true })
    discounted_price: number

    // req-dto-decorators
    @IsEnum(ProductStatus)
    // mongo-schema-decorators
    @Prop({ required: true, type: String})
    status: ProductStatus

    // req-dto-decorators
    @ApiHideProperty()
    // mongo-schema-decorators
    @Prop({ required: false, type: Date, default: new Date() })
    created_at: Date;

    // req-dto-decorators
    @ApiHideProperty()
    // mongo-schema-decorators
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Store' })
    store: Types.ObjectId;

    constructor(product : Product){
        if (!product) return
        this._id = product._id?.toString()
        this.name= product.name
        this.store= product.store?.toString()
        this.status= product.status
        this.images= product.images
        this.quantity= product.quantity
        this.base_price= product.base_price
        this.created_at= product.created_at
        this.description= product.description
        this.discounted_price= product.discounted_price
    }




}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type ProductProjection = {
    [key in keyof Product]?: 0 | 1
};

export class UpdateProductDto extends PartialType(Product) {}
