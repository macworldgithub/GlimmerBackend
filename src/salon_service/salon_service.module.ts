import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalonServicesController } from './salon_service.controller';
import { SalonServicesService } from './salon_service.service';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/aws/s3.service';
import { SalonServicesRepository } from './salon_service.repository';
import { SalonService } from 'src/salon/salon.service';
import { SalonServiceSchema } from 'src/schemas/salon/salon_service.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SalonService.name, schema: SalonServiceSchema },
    ]),
  ],
  controllers: [SalonServicesController],
  providers: [
    SalonServicesService,
    SalonServicesRepository,
    JwtService,
    S3Service,
  ],
  exports: [SalonServicesRepository],
})
export class SalonServiceModule {}
