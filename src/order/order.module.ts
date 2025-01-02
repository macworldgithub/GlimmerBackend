import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtService } from '@nestjs/jwt';
import { OrderRepository } from './order.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/ecommerce/order.schema';
import { OrderItem, OrderItemSchema } from 'src/schemas/ecommerce/order_item.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: OrderItem.name, schema: OrderItemSchema},
        ]),
    ],
    controllers: [OrderController],
    providers: [OrderService, JwtService, OrderRepository],
    exports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: OrderItem.name, schema: OrderItemSchema},
        ]),
    ],
})
export class OrderModule { }
