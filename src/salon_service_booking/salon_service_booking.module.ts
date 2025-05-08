import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/aws/s3.service';
import { SalonServiceBooking, SalonServiceBookingSchema } from 'src/schemas/salon/salon_service_booking.schema';
import { SalonServiceBookingRepository } from './salon_service_booking.repository';
import { SalonServiceBookingController } from './salon_service_booking.controller';
import { SalonServiceBookingService } from './salon_service_booking.service';
import { SalonServicesRepository } from 'src/salon_service/salon_service.repository';
import { SalonServicesCategoriesRepository } from 'src/salon_service_categories/salon_service_categories.repository';
import { SalonService } from 'src/salon/salon.service';
import { SalonServiceSchema } from 'src/schemas/salon/salon_service.schema';
import { SalonServiceCategories, SalonServiceCategoriesSchema } from 'src/schemas/salon/salon_service_categories.schema';
import { BookingGateway } from './salon_service_booking_gateway';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SalonServiceBooking.name, schema: SalonServiceBookingSchema },
    ]),
    MongooseModule.forFeature([
      { name: SalonService.name, schema: SalonServiceSchema },
    ]),
    MongooseModule.forFeature([
      { name: SalonServiceCategories.name, schema: SalonServiceCategoriesSchema },
    ]),
    NotificationModule,
  ],
  controllers: [SalonServiceBookingController],
  providers: [
    SalonServiceBookingService,
    SalonServiceBookingRepository,
    SalonServicesRepository,
    SalonServicesCategoriesRepository,
    JwtService,
    S3Service,
    BookingGateway,
  ],
  exports: [SalonServiceBookingRepository],
})
export class SalonServiceBookingModule {}
