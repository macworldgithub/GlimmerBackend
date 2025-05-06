import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalonServicesController } from './salon_service.controller';
import { SalonServicesService } from './salon_service.service';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/aws/s3.service';
import { SalonServicesRepository } from './salon_service.repository';
import { SalonService } from 'src/salon/salon.service';
import { SalonServiceSchema } from 'src/schemas/salon/salon_service.schema';
import { Salon, SalonSchema } from 'src/schemas/salon/salon.schema';
import { SalonModule } from 'src/salon/salon.module';
import { SalonRepository } from 'src/salon/salon.repository';

import {
  SalonServiceCategories,
  SalonServiceCategoriesSchema,
} from 'src/schemas/salon/salon_service_categories.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SalonService.name, schema: SalonServiceSchema },
      { name: Salon.name, schema: SalonSchema },
      {
        name: SalonServiceCategories.name,
        schema: SalonServiceCategoriesSchema,
      },
    ]),
  ],
  controllers: [SalonServicesController],
  providers: [
    SalonServicesService,
    SalonServicesRepository,
    SalonRepository,
    JwtService,
    S3Service,
    SalonModule,
  ],
  exports: [SalonServicesRepository],
})
export class SalonServiceModule {}
