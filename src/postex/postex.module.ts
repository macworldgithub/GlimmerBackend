import { Module } from '@nestjs/common';
import { PostexController } from './postex.controller';
import { PostexService } from './postex.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RegisteredPostexOrder,
  RegisteredPostexOrderSchema,
} from 'src/schemas/ecommerce/registered_postex_order';
import { Order, OrderSchema } from 'src/schemas/ecommerce/order.schema';

@Module({
  controllers: [PostexController],
  providers: [PostexService],
  imports: [
    MongooseModule.forFeature([
      { name: RegisteredPostexOrder.name, schema: RegisteredPostexOrderSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
})
export class PostexModule {}
