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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    StoreService,
    StoreRepository,
    AwsService,
    S3Service,
    OrderRepository,
  ],
})
export class AppModule {}
