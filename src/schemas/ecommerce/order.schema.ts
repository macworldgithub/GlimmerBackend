import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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

  @Prop({ required: true, default: 'Pending' })
  status!: string;

  @Prop({ required: true })
  store!: string;

  @Prop({ type: [TypeSchema] }) // ✅ Accepts an array of Type
  type!: any[];

  @Prop({ type: [SizeSchema] }) // ✅ Accepts an array of Size
  size!: any[];
}
export const ProductSchema = SchemaFactory.createForClass(Product);

@Schema({ _id: false })
class CompleteOrder {
  @Prop({ type: ProductSchema, required: true })
  product!: Product;

  @Prop({ required: true })
  quantity!: number;
}
export const CompleteOrderSchema = SchemaFactory.createForClass(CompleteOrder);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  customerId!: string;

  @Prop({ required: true })
  customerEmail!: string;

  @Prop({ type: [CompleteOrderSchema], required: true })
  productList!: CompleteOrder[];

  @Prop({ required: true })
  total!: number;

  @Prop({ required: true })
  discountedTotal!: number;

  @Prop({
    required: true,
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'COD'],
    default: 'COD',
  })
  paymentMethod!: number;

  @Prop({
    required: true,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  })
  status!: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
