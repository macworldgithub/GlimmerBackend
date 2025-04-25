import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RecommendedProducts,
  RecommendedProductsSchema,
} from 'src/schemas/recommendedProducts/recommendedproducts.schema';

import { ProductSchema, Product } from 'src/schemas/ecommerce/product.schema';

import { AdminController } from './admin.controller';
import { S3Service } from 'src/aws/s3.service';
import { OrderService } from 'src/order/order.service';
import { Salon, SalonSchema } from 'src/schemas/salon/salon.schema';

@Module({
  providers: [AdminService ,S3Service],
  controllers: [AdminController],
  exports: [
    MongooseModule.forFeature([
      { name: RecommendedProducts.name, schema: RecommendedProductsSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Salon.name, schema: SalonSchema }
      // MongooseModule.forFeature([{ name: Salon.name, schema: SalonSchema }]),
    ]),
  ],
  imports: [
    MongooseModule.forFeature([
      { name: RecommendedProducts.name, schema: RecommendedProductsSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Salon.name, schema: SalonSchema }

    ]),
  ],
})
export class AdminModule {}
