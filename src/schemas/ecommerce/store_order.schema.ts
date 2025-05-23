// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Store } from './store.schema';
import { OrderStatus } from 'src/order/enums/order_status.enum';
import { Product } from './product.schema';
import { Order } from './order.schema';
import { OrderItem } from './order_item.schema';
import { PartialType, PickType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export type StoreOrderDocument = HydratedDocument<StoreOrder>;

@Schema()
export class StoreOrder {
  @IsEnum(OrderStatus)
  @Prop({ type: String, required: true, default: OrderStatus.CONFIRMED })
  status: OrderStatus;

  // mongo-schema-decorators
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'OrderItem' })
  order_items: OrderItem[] | mongoose.Types.ObjectId[];

  // mongo-schema-decorators
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  order: Order | mongoose.Types.ObjectId;

  // mongo-schema-decorators
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Store' })
  store: Store | mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true, default: new Date() })
  created_at: Date;
}

export const StoreOrderSchema = SchemaFactory.createForClass(StoreOrder);

export type OrderProjection = {
  [key in keyof Order]?: 0 | 1;
};

export class UpdateStoreOrder extends PartialType(
  PickType(StoreOrder, ['status'] as const),
) {}
