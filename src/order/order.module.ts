import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtService } from '@nestjs/jwt';
import { OrderRepository } from './order.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/ecommerce/order.schema';
import { OrderItem, OrderItemSchema } from 'src/schemas/ecommerce/order_item.schema';
import { StoreOrder, StoreOrderSchema } from 'src/schemas/ecommerce/store_order.schema';
import { ProductRepository } from 'src/product/product.repository';
import { Product, ProductSchema } from 'src/schemas/ecommerce/product.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: OrderItem.name, schema: OrderItemSchema},
            { name: StoreOrder.name, schema: StoreOrderSchema},
            { name: Product.name, schema: ProductSchema },
        ]),
    ],
    controllers: [OrderController],
    providers: [OrderService, JwtService, OrderRepository, ProductRepository],
    exports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: OrderItem.name, schema: OrderItemSchema},
            { name: StoreOrder.name, schema: StoreOrderSchema},
        ]),
    ],
})
export class OrderModule { }
