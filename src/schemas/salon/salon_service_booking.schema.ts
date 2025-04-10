import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type SalonServiceBookingDocument = HydratedDocument<SalonServiceBooking>;

@Schema({ timestamps: true })
export class SalonServiceBooking {
  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ required: true, min: 1 })
  serviceDuration: number;

  @Prop()
  serviceDescription?: string;

  @Prop({ required: true })
  salonId: string;

  @Prop({ required: true })
  categoryId: string;

  @Prop({ required: true })
  categoryName: string;

  @Prop()
  subCategoryName?: string;

  @Prop()
  subSubCategoryName?: string;

  @Prop({ required: true, default: false })
  isDiscounted: boolean;

  @Prop({ default: 0, min: 0, max: 100 })
  discountPercentage?: number;

  @Prop({ required: true, min: 0, default: 0 })
  actualPrice: number;

  @Prop({ required: true, min: 0, default: 0 })
  finalPrice: number;

  @Prop({ required: true })
  bookingDate: Date;
  
  @Prop({ required: true })
  bookingTime: string;

  @Prop({ required: true, enum: ['Prepaid (Card)', 'Pay at Counter'] })
  paymentMethod: string;

  @Prop({ required: true, enum: ['Pending','Rejected', 'Approved', 'Completed','Completed And Paid', 'Did not show up'], default: 'Pending' })
  bookingStatus: string;

  @Prop({ required: false, default: false })
  isPaid: boolean;

  constructor(
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    serviceName: string,
    serviceDuration: number,
    salonId: string,
    categoryId: string,
    categoryName: string,
    bookingDate: Date,
    bookingTime: string,
    paymentMethod: 'Prepaid (Card)' | 'Pay at Counter',
    bookingStatus: 'Pending' | 'Approved' |'Rejected'| 'Completed' |'Completed And Paid'| 'Did not show up' = 'Pending',
    isPaid = false,
    actualPrice: number,
    finalPrice: number,
    isDiscounted = false,
    discountPercentage = 0,
    serviceDescription?: string,
    subCategoryName?: string,
    subSubCategoryName?: string,
  ) {
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.customerPhone = customerPhone;
    this.serviceName = serviceName;
    this.serviceDuration = serviceDuration;
    this.salonId = salonId;
    this.categoryId = categoryId;
    this.categoryName = categoryName;
    this.bookingDate = bookingDate;
    this.bookingTime = bookingTime;
    this.paymentMethod = paymentMethod;
    this.bookingStatus = bookingStatus;
    this.isPaid = isPaid;
    this.actualPrice = actualPrice;
    this.finalPrice = finalPrice;
    this.isDiscounted = isDiscounted;
    this.discountPercentage = discountPercentage;
    this.serviceDescription = serviceDescription;
    this.subCategoryName = subCategoryName;
    this.subSubCategoryName = subSubCategoryName;
  }
}

export const SalonServiceBookingSchema = SchemaFactory.createForClass(SalonServiceBooking);
