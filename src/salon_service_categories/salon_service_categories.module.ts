import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalonServicesCategoriesRepository } from './salon_service_categories.repository';
import { SalonServiceCategoriesController } from './salon_service_categories.controller';
import { SalonServiceCategoriesService } from './salon_service_categories.service';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/aws/s3.service';
import {
  SalonServiceCategories,
  SalonServiceCategoriesSchema,
} from '../schemas/salon/salon_service_categories.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SalonServiceCategories.name,
        schema: SalonServiceCategoriesSchema,
      },
    ]),
  ],
  controllers: [SalonServiceCategoriesController],
  providers: [
    SalonServiceCategoriesService,
    SalonServicesCategoriesRepository,
    JwtService,
    S3Service,
  ],
  exports: [SalonServicesCategoriesRepository],
})
export class SalonServiceCatgegoriesModule {}
