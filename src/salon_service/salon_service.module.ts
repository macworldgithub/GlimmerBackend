import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalonRepository } from './salon_service.repository';
import { SalonServiceController } from './salon_service.controller';
import { SalonServiceService } from './salon_service.service';
import { Salon, SalonSchema } from 'src/schemas/salon/salon.schema';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/aws/s3.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Salon.name, schema: SalonSchema }]),
  ],
  controllers: [SalonServiceController],
  providers: [SalonServiceService, SalonRepository, JwtService, S3Service],
  exports: [SalonRepository],
})
export class SalonServiceModule {}
