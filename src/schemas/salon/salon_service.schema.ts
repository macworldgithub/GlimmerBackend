import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type SalonServiceDocument = HydratedDocument<SalonServiceCategories>;

@Schema()
export class SalonServiceCategories {
  @Prop({ required: true })
  category!: string;

  @Prop({ type: Object, required: true })
  services!: Record<string, string[] | string>;
}

export const SalonServiceCatehoriesSchema = SchemaFactory.createForClass(
  SalonServiceCategories,
);
