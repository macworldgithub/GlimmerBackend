// @ts-nocheck
import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
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


    @Prop({ type: Date, required: true, default: new Date() })
    created_at: Date;


    @Virtual({
        get: function(this: Order) {
            return `returning total`;
        },
    })
    total: number

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'OrderItem' })
    order_items: OrderItem[] | mongoose.Types.ObjectId[]

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' })
    customer: Customer | mongoose.Types.ObjectId[]


    constructor(obj: Order){
        if (!obj) return
        this.status = obj.status
        this.customer = obj.customer,
        this.created_at = obj.created_at,
        this.order_items = obj.order_items
    }
}

export const OrderSchema = SchemaFactory.createForClass(Order);

