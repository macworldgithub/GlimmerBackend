// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Store } from './store.schema';
import { OrderStatus } from 'src/order/enums/order_status.enum';
import { ApiHideProperty } from '@nestjs/swagger';
import { OrderItem } from './order_item.schema';
import { Customer } from '../customer.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema()
export class Order {
    @Prop({ type: String, required: true, default: OrderStatus.CONFIRMED })
    status: OrderStatus;

    @Prop({ required: true })
    total: number;

    @Prop({ type: Date, required: true, default: new Date() })
    created_at: Date;


    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'OrderItem' })
    order_items: OrderItem[]

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Customer' })
    customer: Customer

}

export const OrderSchema = SchemaFactory.createForClass(Order);

