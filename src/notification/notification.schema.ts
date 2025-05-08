import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  message!: string;

  @Prop({ default: false }) // Ensure default read status
  read!: boolean;

  @Prop({ required: true })
  userId!: string;

  // Optionally include order or extra data here
  @Prop({ type: Object })
  data: any;
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
