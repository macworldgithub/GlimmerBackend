import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { StoreService } from './store/store.service';
import { StoreModule } from './store/store.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MongooseModule.forRoot("mongodb+srv://salman:4lanHyMRdCrtXDJ7@sign365.nglnioh.mongodb.net/"), ProductModule, OrderModule, StoreModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, StoreService],
})
export class AppModule {}
