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

  @Prop({ type: String, required: true })
  openingHour: string;

  @Prop({ type: String, required: true })
  closingHour: string;

  @Prop({ type: String, required: false, default: null })
  image1?: string;
  @Prop({ type: String, required: false, default: null })
  image2?: string;
  @Prop({ type: String, required: false, default: null })
  image3?: string;
  @Prop({ type: String, required: false, default: null })
  image4?: string;

  @Prop({ type: Boolean, required: false, default: false })
  newToGlimmer!: boolean;

  @Prop({ type: Boolean, required: false, default: false })
  trendingSalon!: boolean;

  @Prop({ type: Boolean, required: false, default: false })
  recommendedSalon!: boolean;

  constructor(obj: Salon) {
    this._id = obj._id.toString();
    this.salon_name = obj.salon_name;
    this.email = obj.email;
    this.password = obj.password;
    this.contact_number = obj.contact_number;
    this.address = obj.address;
    this.about = obj.about;
    this.openingHour = obj.openingHour;
    this.closingHour = obj.closingHour;
    this.image1 = obj.image1;
    this.image2 = obj.image2;
    this.image3 = obj.image3;
    this.image4 = obj.image4;
  }
}

export const SalonSchema = SchemaFactory.createForClass(Salon);

export type SalonProjection = {
  [key in keyof Salon]?: 0 | 1;
};
// export class UpdateSaloonDto extends PartialType(
//   OmitType(CreateSalonDto, ['password' as const]),
// ) {}
