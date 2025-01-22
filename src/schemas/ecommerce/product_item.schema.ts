// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ProductSubCategory } from './product_sub_category.schema';

export type ProductItemSchema = HydratedDocument<ProductItem>;

@Schema()
export class ProductItem{
  @Prop()
  name: string;

  @Prop({ default: new Date() })
  created_at: Date;

  @Prop()
  description?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductSubCategory' })
  product_sub_category: ProductSubCategory | mongoose.Types.ObjectId;
}

export const ProductItemSchema =
  SchemaFactory.createForClass(ProductItem);
