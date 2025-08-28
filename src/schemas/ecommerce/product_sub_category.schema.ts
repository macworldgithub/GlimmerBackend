// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { ProductCategory } from './product_category.schema';

export type ProductSubCategorySchema = HydratedDocument<ProductSubCategory>;

@Schema()
export class ProductSubCategory {
  @Prop()
  name: string;

  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ unique: true, required: true })
  slug: string;

  @Prop({ default: new Date() })
  created_at: Date;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'ProductCategory', required: true })
  product_category: Types.ObjectId;
}

export const ProductSubCategorySchema =
  SchemaFactory.createForClass(ProductSubCategory);

  ProductSubCategorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
      this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
  });
  