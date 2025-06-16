// src/order/schemas/registered-postex-order.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RegisteredPostexOrderDocument = RegisteredPostexOrder & Document;

@Schema({ timestamps: true })
export class RegisteredPostexOrder {
  @Prop({ required: true })
  orderId!: string; // Original MongoDB Order ID

  @Prop({ required: true })
  trackingNumber!: string;

  @Prop({ required: true })
  orderDate!: string;

  @Prop({ default: false })
  deliver_to_postex!: boolean;

  @Prop({
    enum: ['confirmed', 'delivered', 'cancelled'],
    default: 'confirmed',
  })
  orderStatus!: 'confirmed' | 'delivered' | 'cancelled';
}

export const RegisteredPostexOrderSchema = SchemaFactory.createForClass(
  RegisteredPostexOrder,
);
