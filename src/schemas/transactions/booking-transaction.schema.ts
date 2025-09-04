import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookingTransactionDocument = BookingTransaction & Document;

@Schema({ timestamps: true })
export class BookingTransaction {
  @Prop({ required: true })
  transactionId!: string; 

  @Prop()
  customerEmail!: string;

  @Prop()
  amount!: string;

  @Prop()
  currency!: string;

  @Prop()
  status!: string;

  @Prop()
  paymentGateway!: string; 

  @Prop()
  gatewayBookingId?: string;

  @Prop()
  gatewaySessionId?: string;

  @Prop()
  successIndicator?: string;
}

export const BookingTransactionSchema =
  SchemaFactory.createForClass(BookingTransaction);