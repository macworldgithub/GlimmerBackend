import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatLogDocument = ChatLog & Document;

@Schema({ timestamps: true })
export class ChatLog {
  @Prop({ required: true })
  sessionId!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ required: true, enum: ['user', 'bot'] })
  from!: string;
}

export const ChatLogSchema = SchemaFactory.createForClass(ChatLog);
