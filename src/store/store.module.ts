import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from 'src/schemas/ecommerce/store.schema';
import { StoreRepository } from './store.repository';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/aws/s3.service';
import { OrderRepository } from 'src/order/order.repository';
import { Order, OrderSchema } from 'src/schemas/ecommerce/order.schema';
import {
  OrderItem,
  OrderItemSchema,
} from 'src/schemas/ecommerce/order_item.schema';
import {
  StoreOrder,
  StoreOrderSchema,
} from 'src/schemas/ecommerce/store_order.schema';
import { ProductService } from 'src/product/product.service';
import { ProductRepository } from 'src/product/product.repository';
import { Product, ProductSchema } from 'src/schemas/ecommerce/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema}]),
    MongooseModule.forFeature([
      { name: OrderItem.name, schema: OrderItemSchema },
    ]),
    MongooseModule.forFeature([
      { name: StoreOrder.name, schema: StoreOrderSchema },
    ]),
  ],
  controllers: [StoreController],
  providers: [
    StoreService,
    StoreRepository,
    JwtService,
    S3Service,
    ProductService,
    ProductRepository,
    OrderRepository,
  ],
  exports: [
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema}]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([
      { name: OrderItem.name, schema: OrderItemSchema },
    ]),
    MongooseModule.forFeature([
      { name: StoreOrder.name, schema: StoreOrderSchema },
    ]),
  ],
})
export class StoreModule {}

//If you also want to use the models in another module, add MongooseModule to the exports section of CatsModule and import CatsModule in the other module.
