// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type SalonServiceDocument = HydratedDocument<SalonServiceCategories>;

@Schema()
export class SalonServiceCategories {
  @Prop({ required: true })
  category!: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  services!: Record<string, any> | Record<string, any>[];
}

export const SalonServiceCategoriesSchema = SchemaFactory.createForClass(
  SalonServiceCategories,
);
