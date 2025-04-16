import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RecommendedProducts,
  RecommendedProductsSchema,
} from 'src/schemas/recommendedProducts/recommendedproducts.schema';

import { ProductSchema ,Product } from 'src/schemas/ecommerce/product.schema';

import { AdminController } from './admin.controller';

@Module({
  providers: [AdminService],
  controllers:[AdminController],
  exports:[AdminService],
  imports: [
    MongooseModule.forFeature([
      { name: RecommendedProducts.name, schema: RecommendedProductsSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
})
export class AdminModule {}
