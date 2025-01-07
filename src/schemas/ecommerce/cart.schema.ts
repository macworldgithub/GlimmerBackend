// @ts-nocheck
import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Customer } from '../customer.schema';
import { CartItem } from './cart_item.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema()
export class Cart {

    //    @Virtual({
    //        get: function(this: Cart) {
    //            if (!Array.isArray(this.order_items) || !this.order_items.every(item => item instanceof OrderItem) || !(this.customer instanceof Customer)) {
    //                return null
    //            }
    //            let total = 0
    //            this.order_items.forEach(item => {
    //                if (item.product.discounted_price) {
    //                    total += item.product.discounted_price
    //                } else {
    //                    total += item.product.base_price
    //                }
    //            })
    //            return total
    //        },
    //    })
    //    total: number | null 

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'CartItem' })
    cart_items: CartItem[] | mongoose.Types.ObjectId[]

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' })
    customer: Customer | mongoose.Types.ObjectId


    constructor(obj: Cart) {
        if (!obj) return
        this.customer = obj.customer,
            this.cart_items = obj.cart_items
    }
}

export const CartSchema = SchemaFactory.createForClass(Cart);

