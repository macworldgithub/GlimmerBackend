import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { S3Service } from 'src/aws/s3.service';
import { SalonRepository } from './salon.repository';
import { CreateSalonDto, UpdateSaloonDto } from './dto/salon.dto';
import { Salon } from 'src/schemas/salon/salon.schema';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { Types } from 'mongoose';

@Injectable()
export class SalonService {
  constructor(
    private salon_repository: SalonRepository,
    private s3_service: S3Service,
  ) {}

  public static readonly GET_SALON_IMAGE_PATH = (id: string) => {
    return `glimmer/brands/${id}/salon_image/image1`;
  };

  async updateSalon(
    update_salon_Dto: UpdateSaloonDto,
    salon_payload: AuthPayload,
  ) {
    try {
      const update_obj: any = update_salon_Dto;
      Object.keys(update_obj).forEach((key) => {
        if (
          update_obj[key] === '' ||
          update_obj[key] === null ||
          update_obj[key] === undefined
        ) {
          delete update_obj[key];
        }
      });
      if (update_salon_Dto.salon_image) {
        const path = SalonService.GET_SALON_IMAGE_PATH(salon_payload._id);
        const salon_image = (
          await this.s3_service.upload_file_by_key(
            update_salon_Dto.salon_image,
            path,
          )
        ).Key;
        update_obj.salon_image = salon_image;
      }
      console.log(update_obj, 'update_obj');
      const salon = await this.salon_repository.update_salon(
        new Types.ObjectId(salon_payload._id),
        update_obj,
      );
      if (!salon) {
        throw new BadRequestException('Store coulnot be updated');
      }
      if (salon.salon_image) {
        salon.salon_image = await this.s3_service.get_image_url(
          salon.salon_image,
        );
      }

      return new Salon(salon);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }
}

// const existingSalon = await this.salon_repository.get_salon_by_id(
//     new Types.ObjectId(salon_payload._id),
//   );

//   if (!existingSalon) {
//     throw new NotFoundException('Salon not found');
//   }

//   // Update salon data
//   return await this.salon_repository.update(existingSalon.id, createSalonDto);
