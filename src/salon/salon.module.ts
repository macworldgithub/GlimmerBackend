import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalonRepository } from './salon.repository';
import { SalonController } from './salon.controller';
import { SalonService } from './salon.service';
import {  Salon, SalonSchema } from 'src/schemas/salon/salon.schema';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/aws/s3.service';
@Module({
  imports: [
    MongooseModule.forFeature([
              { name: Salon.name, schema: SalonSchema},
        
    ]),
  ],
  controllers: [SalonController],
  providers: [SalonService, SalonRepository,
    JwtService,
        S3Service,
  ],
  exports: [SalonRepository],
})
export class SalonModule {}
