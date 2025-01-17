// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductCategorySchema = HydratedDocument<ProductCategory>;

@Schema()
export class ProductCategory {
  @Prop()
  name: string;

  @Prop({ default: new Date() })
  created_at: string;

  @Prop()
  description?: string;
}

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
