import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SalonDocument = Salon & Document;

@Schema({ timestamps: true })
export class Salon {
  @Prop({ required: true })
  salon_name!: string;

  @Prop({ required: true })
  owner_name!: string;

  @Prop({ required: true })
  owner_contact_email!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  contact_number!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({ required: true })
  about!: string;

  // Assuming you store the picture path or URL in the database.
  @Prop({ required: true })
  salon_image!: string;
}

export type SalonProjection = {
  [key in keyof Salon]?: 0 | 1;
};

export const SalonSchema = SchemaFactory.createForClass(Salon);
