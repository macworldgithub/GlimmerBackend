// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { ProductSubCategory } from './product_sub_category.schema';

export type ProductItemSchema = HydratedDocument<ProductItem>;

@Schema()
export class ProductItem {
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductSubCategory' })
  product_sub_category: ProductSubCategory | mongoose.Types.ObjectId;
}

export const ProductItemSchema = SchemaFactory.createForClass(ProductItem);

ProductItemSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
