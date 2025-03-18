// @ts-nocheck

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OmitType, PartialType } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { CreateSalonDto } from 'src/salon/dto/salon.dto';

export type SalonDocument = HydratedDocument<Salon>;

@Schema({ timestamps: true })
export class Salon {
  @Prop({ type: String, required: true })
  salon_name: string;

  @Prop({ type: String, required: true })
  owner_name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  owner_contact_email: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  contact_number: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  about: string;

  @Prop({ type: String, required: false, default: null })
  salon_image?: string;
  constructor(obj: Salon) {
    this._id = obj._id.toString();
    this.salon_name = obj.salon_name;
    this.owner_name = obj.owner_name;
    this.owner_contact_email = obj.owner_contact_email;
    this.email = obj.email;
    this.password = obj.password;
    this.contact_number = obj.contact_number;
    this.address = obj.address;
    this.about = obj.about;
    this.salon_image = obj.salon_image;
  }
}

export const SalonSchema = SchemaFactory.createForClass(Salon);

export type SalonProjection = {
  [key in keyof Salon]?: 0 | 1;
};
// export class UpdateSaloonDto extends PartialType(
//   OmitType(CreateSalonDto, ['password' as const]),
// ) {}
