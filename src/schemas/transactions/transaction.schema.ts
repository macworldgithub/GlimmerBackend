// 1.2 transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  transactionId!: string; // e.g. pp_TxnRefNo or bank_ref

  @Prop()
  customerEmail!: string;

  @Prop()
  amount!: string;

  @Prop()
  currency!: string;

  @Prop()
  status!: string;

  @Prop()
  paymentGateway!: string; // e.g. 'JazzCash', 'BankX'
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
