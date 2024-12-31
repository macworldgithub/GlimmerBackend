import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Product } from './product.schema';
import * as mongoose from 'mongoose'
import { Order } from './order.schema';

export type CatDocument = HydratedDocument<OrderItem>;

@Schema()
export class OrderItem {

    @Prop()
    quantity: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: Product;


    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
    order: Order;

}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

