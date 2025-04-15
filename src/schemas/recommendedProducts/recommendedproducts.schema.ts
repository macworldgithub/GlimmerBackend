import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecommendedProductsDocument = RecommendedProducts & Document;

@Schema({ _id: false })
export class ProductItem {
  @Prop({ required: true })
  productId!: string;

  @Prop({ type: String })
  ref!: string;

  @Prop({ type: Number, default: 0 })
  soldUnits!: number;

  @Prop({type:Number ,default:0})
  returnedUnits!: number

  
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
