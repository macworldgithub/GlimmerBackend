import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SalonServiceDocument = SalonService & Document;

@Schema({ timestamps: true })
export class SalonService {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  categoryId: string;
  @Prop({ required: true })
  salonId: string;
  

  @Prop()
  subCategoryName?: string;

  @Prop()
  subSubCategoryName?: string;
@Prop({ required: false, default: '' })
image1?: string;

@Prop({ required: false, default: '' })
image2?: string;

@Prop({ required: false, default: '' })
image3?: string;
  @Prop()
  description?: string;

  @Prop({ required: true, min: 1 })
  duration: number;

  @Prop({ required: false, min: 0, default: 0 })
  actualPrice: number;

  @Prop({ required: false, min: 0, default: 0 })
  adminSetPrice: number;

  @Prop({
    type: String,
    enum: ['pending', 'assigned'],
    default: 'pending',
  })
  priceUpdateStatus: string;

  @Prop({ type: Number, min: 0 })
  requestedPrice?: number;

  @Prop({ default: false })
  hasDiscount: boolean;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: 0, min: 0, max: 100 })
  discountPercentage?: number;

  @Prop({ default: false })
  isGlobalDiscount?: boolean;

  constructor(
    name: string,
    categoryId: string,
    salonId: string,
    duration: number,
    actualPrice: number,
    adminSetPrice: number,
    subCategoryName?: string,
    subSubCategoryName?: string,
    image1?: string,
    image2?: string,
    image3?: string,
    description?: string,
    hasDiscount = false,
    status = true,
    discountPercentage = 0,
    isGlobalDiscount = false,
    priceUpdateStatus: 'pending' | 'approved' | 'rejected' = 'pending',
    requestedPrice?: number,
  ) {
    this.name = name;
    this.categoryId = categoryId;
    this.salonId = salonId;
    this.image1 = image1;
    this.image2 = image2;
    this.image3 = image3;
    this.subCategoryName = subCategoryName;
    this.subSubCategoryName = subSubCategoryName;
    this.description = description;
    this.status = status;
    this.duration = duration;
    this.actualPrice = actualPrice;
    this.adminSetPrice = adminSetPrice;
    this.hasDiscount = hasDiscount;
    this.discountPercentage = discountPercentage;
    this.isGlobalDiscount = isGlobalDiscount;
    this.priceUpdateStatus = priceUpdateStatus;
    this.requestedPrice = requestedPrice;
  }
}

export const SalonServiceSchema = SchemaFactory.createForClass(SalonService);
