import { Module } from '@nestjs/common';
import { AlfalahService } from './alfalah.service';
import { AlfalahController } from './alfalah.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/ecommerce/order.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions/transaction.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [AlfalahService],
  controllers: [AlfalahController],

  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
      HttpModule,
  ],
})
export class AlfalahModule {}
