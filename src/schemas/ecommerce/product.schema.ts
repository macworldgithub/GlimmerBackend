// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProductStatus } from 'src/product/enums/product_status.enum';
import * as mongoose from 'mongoose';
import { PartialType } from '@nestjs/swagger';
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
  @Prop({ required: false, default: '' })
  image1?: string;

  // mongo-schema-decorators
  @Prop({ required: false, default: '' })
  image2?: string;

  // mongo-schema-decorators
  @Prop({ required: false, default: '' })
  image3?: string;

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

  // mongo-schema-decorators
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' })
  category: Types.ObjectId;

  // mongo-schema-decorators
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductSubCategory' })
  sub_category: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductItem' })
  item?: Types.ObjectId;

  // ✅ Updated type field: Array of objects
  @Prop({
    default: [],
  })
  type?: [];

  // ✅ Updated size field: Array of objects with unit
  @Prop({
    default: [],
  })
  size?: [];

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
    this.category = product.category?.toString();
    this.sub_category = product.sub_category?.toString();
    this.item = product.item?.toString();

    this.type = product.type ?? null;
    this.size = product.size ?? null;
  }
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type ProductProjection = {
  [key in keyof Product]?: 0 | 1;
};
