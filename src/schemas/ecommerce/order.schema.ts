// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Store } from './store.schema';
import { OrderStatus } from 'src/order/enums/order_status.enum';

export type OrderDocument = HydratedDocument<Order>;

@Schema()
export class Order {
    @Prop([OrderStatus])
    status: OrderStatus;

    @Prop()
    total: number;

    @Prop([Date])
    created_at: Date;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Store' })
    store: Store;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

