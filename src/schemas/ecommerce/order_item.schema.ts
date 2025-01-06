// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Product } from './product.schema';
import * as mongoose from 'mongoose'
import { Order } from './order.schema';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, Max, Min } from 'class-validator';

export type CatDocument = HydratedDocument<OrderItem>;

@Schema()
export class OrderItem {

    @Prop({ required: true })
    quantity: number;

    @Prop()
    product: Product 

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
    order: Order | mongoose.Types.ObjectId
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export type CreateOrderItem = {
    order: Types.ObjectId;
    quantity: number;
    product: Product
}

