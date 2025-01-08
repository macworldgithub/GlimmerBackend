// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Transform } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { ProductStatus } from 'src/product/enums/product_status.enum';
import { Store } from './store.schema';
import * as mongoose from 'mongoose';
import { ApiHideProperty, ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ImageObject } from 'src/product/dtos/request_dtos/product.dto';

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
        this.images = product.images;
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

export class UpdateProductDto extends PartialType(
    OmitType(Product, ['images'] as const)
) {
    @ApiProperty({
        description: 'Array of image URLs or files',
        type: 'array',
        items: {
            oneOf: [
                { type: 'string', format: 'url', description: 'Image URL' },
                { type: 'string', format: 'binary', description: 'Uploaded file' },
            ],
        },
        required: false,
    })
    @IsOptional()
    images?: Array<Express.Multer.File | string>; // New type for the `images` property
}

