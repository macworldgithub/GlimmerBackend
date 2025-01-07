// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Product } from './product.schema';
import * as mongoose from 'mongoose'

export type CartDocument = HydratedDocument<CartItem>;

@Schema()
export class CartItem{

    @Prop({ required: true })
    quantity: number;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Product' })
    product: Product | mongoose.Types.ObjectId
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
