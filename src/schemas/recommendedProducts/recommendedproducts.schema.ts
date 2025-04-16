import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecommendedProductsDocument = RecommendedProducts & Document;

@Schema({ _id: false })
export class SaleRecord {
  @Prop({ default: Date.now })
  soldAt!: Date; // Date and time at which the product was sold.

  @Prop({ required: true })
  quantity!: number; // Quantity of product sold.

  @Prop({ required: true })
  price!: number; // Price at the time of order.

  @Prop({ required: true })
  salonCut!: number; // Cut of salon.
}

@Schema({ _id: false })
export class ProductItem {
  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  productName!: string;

  @Prop({ type: String })
  ref!: string;

  @Prop({ type: Number, default: 0 })
  soldUnits!: number;

  @Prop({ type: Number, default: 0 })
  returnedUnits!: number;

  @Prop({ type: [SaleRecord], default: [] })
  saleRecords!: SaleRecord[]; // Array of sale records.
}

export const ProductItemSchema = SchemaFactory.createForClass(ProductItem);

@Schema()
export class RecommendedProducts {
  @Prop({ default: 5 })
  rate!: number;

  @Prop({ required: true })
  salonId!: string;

  // The productList field is an array of ProductItem subdocuments.
  @Prop({ type: [ProductItemSchema], default: [] })
  productList!: ProductItem[];
}

export const RecommendedProductsSchema =
  SchemaFactory.createForClass(RecommendedProducts);
