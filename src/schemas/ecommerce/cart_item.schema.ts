// @ts-nocheck

import { Product } from './product.schema';
import * as mongoose from 'mongoose'

export class CartItem{
    quantity: number;
    product: Product | mongoose.Types.ObjectId
}
