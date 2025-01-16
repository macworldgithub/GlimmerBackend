// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProductCategory } from './product_category.schema';

export type ProductSubCategorySchema = HydratedDocument<ProductSubCategory>;

@Schema()
export class ProductSubCategory{
  @Prop()
  name: string;

  @Prop()
  created_at: string;

  @Prop()
  description?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' })
  product_category: ProductCategory | mongoose.Types.ObjectId;
}

export const ProductSubCategorySchema =
  SchemaFactory.createForClass(ProductSubCategory);
