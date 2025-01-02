// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Store } from './store.schema';
import { OrderStatus } from 'src/order/enums/order_status.enum';
import { Product } from './product.schema';
import { Order } from './order.schema';

export type StoreOrderDocument = HydratedDocument<StoreOrder>;

@Schema()
export class StoreOrder{
    @Prop({type : String, required: true, default: OrderStatus.CONFIRMED})
    status: OrderStatus;

    @Prop({ required: true})
    total: number;

    @Prop({type : Date, required: true, default: new Date() })
    created_at: Date;
    

    // mongo-schema-decorators
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: Product


    // mongo-schema-decorators
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
    order: Order

    // mongo-schema-decorators
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Store' })
    store: Store

}

export const StoreOrderSchema = SchemaFactory.createForClass(StoreOrder);
