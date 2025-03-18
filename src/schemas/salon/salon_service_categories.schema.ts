// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SalonServiceDocument = HydratedDocument<SalonServiceCategories>;

@Schema()
export class SalonServiceCategories {
  @Prop({ required: true })
  category!: string;

  @Prop({ type: Map, of: [String], required: true }) // Ensure the correct type definition
  services!: Record<string, string[] | string>;
}

export const SalonServiceCategoriesSchema = SchemaFactory.createForClass(
  SalonServiceCategories,
);
