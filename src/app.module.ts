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

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://salman:4lanHyMRdCrtXDJ7@sign365.nglnioh.mongodb.net/',
    ),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ProductModule,
    OrderModule,
    StoreModule,
    AuthModule,
    CustomerModule,
    CartModule,
    ProductCategoryModule,
    ProductSubCategoryModule,
    ProductItemModule,
    AdminModule,
    NotificationsModule,
    SalonModule,
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
  ],
})
export class AppModule {}
