// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ProductCategory } from './product_category.schema';

export type ProductSubCategorySchema = HydratedDocument<ProductSubCategory>;

@Schema()
export class ProductSubCategory {
  @Prop()
  name: string;

  @Prop({ default: new Date() })
  created_at: Date;

  @Prop()
  description?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' })
  product_category: ProductCategory | mongoose.Types.ObjectId;
}

export const ProductSubCategorySchema =
  SchemaFactory.createForClass(ProductSubCategory);
