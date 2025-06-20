// import { Module } from '@nestjs/common';
// import { PostexController } from './postex.controller';
// import { PostexService } from './postex.service';
// import { MongooseModule } from '@nestjs/mongoose';
// import {
//   RegisteredPostexOrder,
//   RegisteredPostexOrderSchema,
// } from 'src/schemas/ecommerce/registered_postex_order';
// import { Order, OrderSchema } from 'src/schemas/ecommerce/order.schema';

// @Module({
//   controllers: [PostexController],
//   providers: [PostexService],
//   imports: [
//     MongooseModule.forFeature([
//       { name: RegisteredPostexOrder.name, schema: RegisteredPostexOrderSchema },
//       { name: Order.name, schema: OrderSchema },
//     ]),
//   ],
// })
// export class PostexModule {}

import { Module } from '@nestjs/common';
import { PostexController } from './postex.controller';
import { PostexService } from './postex.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RegisteredPostexOrder,
  RegisteredPostexOrderSchema,
} from 'src/schemas/ecommerce/registered_postex_order';
import { Order, OrderSchema } from 'src/schemas/ecommerce/order.schema';
import { Store, StoreSchema } from 'src/schemas/ecommerce/store.schema'; // Import Store schema

@Module({
  controllers: [PostexController],
  providers: [PostexService],
  imports: [
    MongooseModule.forFeature([
      { name: RegisteredPostexOrder.name, schema: RegisteredPostexOrderSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Store.name, schema: StoreSchema }, // Add Store schema
    ]),
  ],
  exports: [PostexService]
})
export class PostexModule {}