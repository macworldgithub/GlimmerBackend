import { Types } from 'mongoose';
import { ProductDocument } from 'src/schemas/ecommerce/product.schema';

export type ProductsByStore = {
  _id: Types.ObjectId;
  products: ProductDocument[];
};
