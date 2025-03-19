import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SalonServiceDocument = SalonService & Document;

@Schema({ timestamps: true })
export class SalonService {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  categoryId: string;

  @Prop()
  subCategoryName?: string;

  @Prop()
  subSubCategoryName?: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 1 })
  duration: number;

  @Prop({ required: false, min: 0 })
  actualPrice: number;

  @Prop({ required: false, min: 0 })
  adminSetPrice: number;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  priceUpdateStatus: string;

  @Prop({ type: Number, min: 0 })
  requestedPrice?: number;

  @Prop({ default: false })
  hasDiscount: boolean;

  @Prop({ default: 0, min: 0, max: 100 })
  discountPercentage?: number;

  @Prop({ default: false })
  isGlobalDiscount?: boolean;

  constructor(
    name: string,
    categoryId: string,
    duration: number,
    actualPrice: number,
    adminSetPrice: number,
    subCategoryName?: string,
    subSubCategoryName?: string,
    description?: string,
    hasDiscount = false,
    discountPercentage = 0,
    isGlobalDiscount = false,
    priceUpdateStatus: 'pending' | 'approved' | 'rejected' = 'pending',
    requestedPrice?: number,
  ) {
    this.name = name;
    this.categoryId = categoryId;
    this.subCategoryName = subCategoryName;
    this.subSubCategoryName = subSubCategoryName;
    this.description = description;
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
