import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Customer } from '../customer.schema';
import { Product } from './product.schema';

export type RatingDocument = HydratedDocument<Rating>;

@Schema({ timestamps: true }) // Enable createdAt and updatedAt
export class Rating {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId; // Non-null assertion

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  userId!: Types.ObjectId; // Non-null assertion

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number; // Non-null assertion

  // Explicitly declare timestamps
  createdAt!: Date;
  updatedAt!: Date;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

// Ensure unique rating per user per product
RatingSchema.index({ productId: 1, userId: 1 }, { unique: true });

export type RatingProjection = {
  [key in keyof Rating]?: 0 | 1;
};