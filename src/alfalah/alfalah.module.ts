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
import { NotificationModule } from 'src/notification/notification.module';
import { OrderGateway } from 'src/order/order.gateway';
import { SalonServiceBooking, SalonServiceBookingSchema } from 'src/schemas/salon/salon_service_booking.schema';
import { BookingTransaction, BookingTransactionSchema } from 'src/schemas/transactions/booking-transaction.schema';
import { BookingGateway } from 'src/salon_service_booking/salon_service_booking_gateway';

@Module({
  providers: [AlfalahService,OrderGateway,BookingGateway],
  controllers: [AlfalahController],
  

  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: SalonServiceBooking.name, schema: SalonServiceBookingSchema },
      { name: BookingTransaction.name, schema: BookingTransactionSchema }, 
    ]),
    NotificationModule,
      HttpModule,
      
  ],
})
export class AlfalahModule {}
