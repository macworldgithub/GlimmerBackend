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
import { SubProductCategoryModule } from './sub_product_category/sub_product_category.module';
import { ProductSubCategoryModule } from './product_sub_category/product_sub_category.module';

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
    SubProductCategoryModule,
    ProductSubCategoryModule,
  ],
  controllers: [AppController, SSE],
  providers: [
    AppService,
    StoreService,
    StoreRepository,
    AwsService,
    S3Service,
    OrderRepository,
    FirebaseService,
  ],
})
export class AppModule {}
