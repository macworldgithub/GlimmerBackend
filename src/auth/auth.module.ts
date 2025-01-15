import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { StoreModule } from 'src/store/store.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StoreRepository } from 'src/store/store.repository';
import { CustomerRepository } from 'src/customer/customer.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from 'src/schemas/customer.schema';
import { S3Service } from 'src/aws/s3.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  imports: [
    StoreModule,
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [
    AuthService,
    CustomerRepository,
    StoreRepository,
    S3Service,
    FirebaseService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
