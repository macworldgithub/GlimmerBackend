// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductCategorySchema = HydratedDocument<ProductCategory>;

@Schema()
export class ProductCategory {

  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ unique: true, required: true })
  slug: string;

  @Prop({ default: new Date() })
  created_at: string;

  @Prop()
  description?: string;
}

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);

ProductCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
