import { Module } from '@nestjs/common';
import { JazzcashController } from './jazzcash.controller';
import { JazzcashService } from './jazzcash.service';

import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/ecommerce/order.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions/transaction.schema';

@Module({
  controllers: [JazzcashController],
  providers: [JazzcashService],
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
})
export class JazzcashModule {}
