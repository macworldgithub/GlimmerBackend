// backend/schemas/faq.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FaqDocument = Faq & Document;

@Schema({ collection: 'faqs' })
export class Faq {
  @Prop({ required: true })
  question!: string;

  @Prop({ required: true })
  answer!: string;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
