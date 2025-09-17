import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Transaction } from '../transactions/transaction.schema';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
class Type {
  @Prop({})
  id!: string; // ✅ Fix applied

  @Prop({ required: true })
  value!: string;
}
export const TypeSchema = SchemaFactory.createForClass(Type);

@Schema({ _id: false })
class Size {
  @Prop({})
  id!: string;

  @Prop({})
  value!: string;

  @Prop({})
  unit!: string;
}
export const SizeSchema = SchemaFactory.createForClass(Size);

@Schema({ _id: false })
class Product {
  @Prop({ required: true })
  _id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  base_price!: number;

  @Prop({ required: true })
  discounted_price!: number;

  @Prop({})
  description!: string;

  @Prop()
  image1?: string;

  @Prop()
  image2?: string;

  @Prop()
  image3?: string;

  @Prop({ required: true })
  status!: string;

  @Prop({ type: [TypeSchema] }) // ✅ Accepts an array of Type
  type!: any[];

  @Prop({ type: [SizeSchema] }) // ✅ Accepts an array of Size
  size!: any[];

  @Prop()
  ref_of_salon!: string;

  @Prop()
  rate_of_salon!: number;
}
export const ProductSchema = SchemaFactory.createForClass(Product);

@Schema({ _id: false })
class ShippingInfo {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  country!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  state!: string;

  @Prop({ required: true })
  zip!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({ required: true, enum: ['Delivery', 'Pick Up'] })
  shippingMethod!: string;
}
export const ShippingInfoSchema = SchemaFactory.createForClass(ShippingInfo);

@Schema({ _id: false })
class CompleteOrder {
  @Prop({ type: ProductSchema, required: true })
  product!: Product;

  @Prop({ required: true })
  storeId!: string;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true })
  total_price!: number;

  @Prop({
    enum: ['Accepted', 'Rejected', 'Pending'],
    default: 'Pending',
  })
  orderProductStatus!: string;
}
export const CompleteOrderSchema = SchemaFactory.createForClass(CompleteOrder);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  customerName!: string;

  @Prop({ required: true })
  customerEmail!: string;

  @Prop({ type: [CompleteOrderSchema], required: true })
  productList!: CompleteOrder[];

  @Prop({ required: true })
  total!: number;

  @Prop({ required: true })
  discountedTotal!: number;
  @Prop({ type: [String], default: [] })
  trackingNumbers?: string[];

  @Prop({ type: Types.ObjectId, ref: 'Transaction', required: true })
  transaction?: Transaction | Types.ObjectId; // ✅ updated type

  @Prop({
    required: true,
    enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
    default: 'Pending',
  })
  status!: string;

  @Prop({ type: ShippingInfoSchema, required: true })
  ShippingInfo!: ShippingInfo;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
