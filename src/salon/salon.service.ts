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
    return `glimmer/brands/${id}/salon_images`;
  };

  async updateSalon(
    update_salon_Dto: UpdateSaloonDto,
    salon_payload: AuthPayload,
  ) {
    try {
      console.log(update_salon_Dto,"lol")
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
      const path = SalonService.GET_SALON_IMAGE_PATH(salon_payload._id);
      if (update_salon_Dto.image1) {
        update_obj.image1 = (
          await this.s3_service.upload_file(
            update_salon_Dto.image1,
            path,
          )
        ).Key;
      }
      if (update_salon_Dto.image2) {
        update_obj.image2 = (
          await this.s3_service.upload_file(
            update_salon_Dto.image2,
            path,
          )
        ).Key;
      }
      if (update_salon_Dto.image3) {
        update_obj.image3 = (
          await this.s3_service.upload_file(
            update_salon_Dto.image3,
            path,
          )
        ).Key;
      }
      if (update_salon_Dto.image4) {
        update_obj.image4 = (
          await this.s3_service.upload_file(
            update_salon_Dto.image4,
            path,
          )
        ).Key;
      }
      console.log(update_obj, 'update_obj');
      const salon = await this.salon_repository.update_salon(
        new Types.ObjectId(salon_payload._id),
        update_obj,
      );
      if (!salon) {
        throw new BadRequestException('Store coulnot be updated');
      }
      if (salon.image1) {
        salon.image1 = await this.s3_service.get_image_url(salon.image1);
      }
      if (salon.image2) {
        salon.image2 = await this.s3_service.get_image_url(salon.image2);
      }
      if (salon.image3) {
        salon.image3 = await this.s3_service.get_image_url(salon.image3);
      }
      if (salon.image4) {
        salon.image4 = await this.s3_service.get_image_url(salon.image4);
      }

      return new Salon(salon);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async getAllSalon(query:any){
    const filter: any = {};

    if (query.salon_name) {
      filter.salon_name = { $regex: new RegExp(query.salon_name, 'i') };

    }

    const page = parseInt(query.page_no, 10) || 1;
    let ser=await this.salon_repository.get_all_salons(filter, page)
    ser.salons = await Promise.all(
      ser.salons.map(async (e) => {
        // @ts-expect-error jhlk
        e._id=e._id.toString()
        if (e.image1) {
          e.image1 = await this.s3_service.get_image_url(e.image1);
        }
        if (e.image2) {
          e.image2 = await this.s3_service.get_image_url(e.image2);
        }
        if (e.image3) {
          e.image3 = await this.s3_service.get_image_url(e.image3);
        }
        if (e.image4) {
          e.image4 = await this.s3_service.get_image_url(e.image4);
        }
        return e;
      })
    );
    console.log(ser)
    return ser;
  }
  async getSalonById(query:any){
    let ser=await this.salon_repository.get_salon_by_id(query.id)
    // @ts-expect-error n ,m
        ser._id=ser._id.toString()
        // @ts-expect-error n ,m
        if (ser.image1) {
          // @ts-expect-error n ,m
          ser.image1 = await this.s3_service.get_image_url(ser.image1);
        }
        // @ts-expect-error n ,m
        if (ser.image2) {
          // @ts-expect-error n ,m
          ser.image2 = await this.s3_service.get_image_url(ser.image2);
        }
        // @ts-expect-error n ,m
        if (ser.image3) {
          // @ts-expect-error n ,m
          ser.image3 = await this.s3_service.get_image_url(ser.image3);
        }
        // @ts-expect-error n ,m
        if (ser.image4) {
          // @ts-expect-error n ,m
          ser.image4 = await this.s3_service.get_image_url(ser.image4);
        }
    console.log(ser)
    return ser;
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
