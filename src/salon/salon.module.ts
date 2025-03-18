import { Module } from '@nestjs/common';
import { SalonController } from './salon.controller';
import { SalonService } from './salon.service';
import { Salon, SalonSchema } from 'src/schemas/salon/salon.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SalonRepository } from './salon.repository';
import { S3Service } from 'src/aws/s3.service';
import { JwtService } from '@nestjs/jwt';
// import { CustomerRepository } from 'src/customer/customer.repository';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AdminRepository } from 'src/admin/admin.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Salon.name, schema: SalonSchema }]),
  ],
  controllers: [SalonController],
  providers: [
    SalonService,
    SalonRepository,
    S3Service,
    JwtService,
    FirebaseService,
  ],
  exports: [SalonRepository],
})
export class SalonModule {}
