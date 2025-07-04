import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { StoreService } from './store/store.service';
import { StoreModule } from './store/store.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { StoreRepository } from './store/store.repository';
import { CustomerModule } from './customer/customer.module';
import { CartModule } from './cart/cart.module';
import { AwsService } from './aws/aws.service';
import { S3Service } from './aws/s3.service';
import { OrderRepository } from './order/order.repository';
import { SSE } from './notifications/sse.service';
import { FirebaseService } from './firebase/firebase.service';
import { ProductCategoryModule } from './product_category/product_category.module';
import { ProductSubCategoryModule } from './product_sub_category/product_sub_category.module';
import { ProductItemModule } from './product_item/product_item.module';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SalonService } from './salon/salon.service';
import { SalonController } from './salon/salon.controller';
import { SalonModule } from './salon/salon.module';
import { JwtService } from '@nestjs/jwt';
import { SalonServiceCatgegoriesModule } from './salon_service_categories/salon_service_categories.module';
import { SalonServiceModule } from './salon_service/salon_service.module';
import { SalonServiceBookingModule } from './salon_service_booking/salon_service_booking.module';
import { AdminService } from './admin/admin.service';
import { NotificationModule } from './notification/notification.module';
import { PostexModule } from './postex/postex.module';
import { JazzcashModule } from './jazzcash/jazzcash.module';
import { AlfalahModule } from './alfalah/alfalah.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // MongooseModule.forRoot(
    //   'mongodb+srv://salman:4lanHyMRdCrtXDJ7@sign365.nglnioh.mongodb.net/',
    // ),
    MongooseModule.forRoot(`${process.env.DATABASE}`),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ProductModule,
    OrderModule,
    StoreModule,
    AuthModule,
    SalonModule,
    SalonServiceCatgegoriesModule,
    SalonServiceModule,
    SalonServiceBookingModule,
    CustomerModule,
    CartModule,
    ProductCategoryModule,
    ProductSubCategoryModule,
    ProductItemModule,
    AdminModule,
    NotificationsModule,
    NotificationModule,
    PostexModule,
    JazzcashModule,
    AlfalahModule,
    ChatModule,
  ],
  controllers: [AppController, SSE, AdminController, SalonController],
  providers: [
    AppService,
    StoreService,
    StoreRepository,
    JwtService,
    AwsService,
    S3Service,
    OrderRepository,
    FirebaseService,
    SalonService,
    AdminService,
  ],
})
export class AppModule {}
