// import {
//   BadRequestException,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { S3Service } from 'src/aws/s3.service';
// import { SalonRepository } from './salon.repository';
// import { CreateSalonDto, UpdateSaloonDto } from './dto/salon.dto';
// import { Salon } from 'src/schemas/salon/salon.schema';
// import { AuthPayload } from 'src/auth/payloads/auth.payload';
// import { Types } from 'mongoose';
// import { SalonStatus } from './enums/salon_status.enum';

// @Injectable()
// export class SalonService {
//   constructor(
//     private salon_repository: SalonRepository,
//     private s3_service: S3Service,
//   ) {}

//   public static readonly GET_SALON_IMAGE_PATH = (id: string) => {
//     return `glimmer/brands/${id}/salon_images`;
//   };

//   async updateSalon(
//     update_salon_Dto: UpdateSaloonDto,
//     salon_payload: AuthPayload,
//   ) {
//     try {
//       console.log(update_salon_Dto,"lol")
//       const update_obj: any = update_salon_Dto;
//       Object.keys(update_obj).forEach((key) => {
//         if (
//           update_obj[key] === '' ||
//           update_obj[key] === null ||
//           update_obj[key] === undefined
//         ) {
//           delete update_obj[key];
//         }
//       });
//       const path = SalonService.GET_SALON_IMAGE_PATH(salon_payload._id);
//       if (update_salon_Dto.image1) {
//         update_obj.image1 = (
//           await this.s3_service.upload_file(
//             update_salon_Dto.image1,
//             path,
//           )
//         ).Key;
//       }
//       if (update_salon_Dto.image2) {
//         update_obj.image2 = (
//           await this.s3_service.upload_file(
//             update_salon_Dto.image2,
//             path,
//           )
//         ).Key;
//       }
//       if (update_salon_Dto.image3) {
//         update_obj.image3 = (
//           await this.s3_service.upload_file(
//             update_salon_Dto.image3,
//             path,
//           )
//         ).Key;
//       }
//       if (update_salon_Dto.image4) {
//         update_obj.image4 = (
//           await this.s3_service.upload_file(
//             update_salon_Dto.image4,
//             path,
//           )
//         ).Key;
//       }
//       console.log(update_obj, 'update_obj');
//       const salon = await this.salon_repository.update_salon(
//         new Types.ObjectId(salon_payload._id),
//         update_obj,
//       );
//       if (!salon) {
//         throw new BadRequestException('Store coulnot be updated');
//       }
//       if (salon.image1) {
//         salon.image1 = await this.s3_service.get_image_url(salon.image1);
//       }
//       if (salon.image2) {
//         salon.image2 = await this.s3_service.get_image_url(salon.image2);
//       }
//       if (salon.image3) {
//         salon.image3 = await this.s3_service.get_image_url(salon.image3);
//       }
//       if (salon.image4) {
//         salon.image4 = await this.s3_service.get_image_url(salon.image4);
//       }

//       return new Salon(salon);
//     } catch (e) {
//       console.log(e);
//       throw new InternalServerErrorException(e);
//     }
//   }

//   async getAllSalon(query:any){
//     const filter: any = {};

//     if (query.salon_name) {
//       filter.salon_name = { $regex: new RegExp(query.salon_name, 'i') };

//     }

//     const page = parseInt(query.page_no, 10) || 1;
//     let ser=await this.salon_repository.get_all_salons(filter, page)
//     ser.salons = await Promise.all(
//       ser.salons.map(async (e) => {
//         // @ts-expect-error jhlk
//         e._id=e._id.toString()
//         if (e.image1) {
//           e.image1 = await this.s3_service.get_image_url(e.image1);
//         }
//         if (e.image2) {
//           e.image2 = await this.s3_service.get_image_url(e.image2);
//         }
//         if (e.image3) {
//           e.image3 = await this.s3_service.get_image_url(e.image3);
//         }
//         if (e.image4) {
//           e.image4 = await this.s3_service.get_image_url(e.image4);
//         }
//         return e;
//       })
//     );
//     console.log(ser)
//     return ser;
//   }
//   async getSalonById(query:any){
//     let ser=await this.salon_repository.get_salon_by_id(query.id)
//     // @ts-expect-error n ,m
//         ser._id=ser._id.toString()
//         // @ts-expect-error n ,m
//         if (ser.image1) {
//           // @ts-expect-error n ,m
//           ser.image1 = await this.s3_service.get_image_url(ser.image1);
//         }
//         // @ts-expect-error n ,m
//         if (ser.image2) {
//           // @ts-expect-error n ,m
//           ser.image2 = await this.s3_service.get_image_url(ser.image2);
//         }
//         // @ts-expect-error n ,m
//         if (ser.image3) {
//           // @ts-expect-error n ,m
//           ser.image3 = await this.s3_service.get_image_url(ser.image3);
//         }
//         // @ts-expect-error n ,m
//         if (ser.image4) {
//           // @ts-expect-error n ,m
//           ser.image4 = await this.s3_service.get_image_url(ser.image4);
//         }
//     console.log(ser)
//     return ser;
//   }
  
//   async deleteSalon(targetSalonId: string) {
//     try {
//       const salon = await this.salon_repository.get_salon_by_id(targetSalonId);
//       if (!salon) {
//         throw new NotFoundException('Salon not found');
//       }

//       const images = [salon.image1, salon.image2, salon.image3, salon.image4].filter(
//         (image): image is string => !!image,
//       );
//       if (images.length > 0) {
//         await Promise.all(images.map((image) => this.s3_service.deleteFileByUrl(image)));
//       }

//       const result = await this.salon_repository.delete_salon_by_id(
//         new Types.ObjectId(targetSalonId),
//       );
//       if (result.deletedCount === 0) {
//         throw new BadRequestException('Salon could not be deleted');
//       }

//       return { message: 'Salon deleted successfully' };
//     } catch (e) {
//       console.log(e);
//       throw new InternalServerErrorException(e);
//     }
//   }

//   async updateSalonStatus(status: SalonStatus, targetSalonId: string): Promise<Salon> {
//     try {
//       if (!Object.values(SalonStatus).includes(status)) {
//         throw new BadRequestException('Invalid status value');
//       }

//       const salon = await this.salon_repository.get_salon_by_id(targetSalonId);
//       if (!salon) {
//         throw new BadRequestException('Salon not found');
//       }

//       const updatedSalon = await this.salon_repository.update_salon(
//         new Types.ObjectId(targetSalonId),
//         { status },
//       );
//       if (!updatedSalon) {
//         throw new BadRequestException('Salon status could not be updated');
//       }

//       if (updatedSalon.image1) {
//         updatedSalon.image1 = await this.s3_service.get_image_url(updatedSalon.image1);
//       }
//       if (updatedSalon.image2) {
//         updatedSalon.image2 = await this.s3_service.get_image_url(updatedSalon.image2);
//       }
//       if (updatedSalon.image3) {
//         updatedSalon.image3 = await this.s3_service.get_image_url(updatedSalon.image3);
//       }
//       if (updatedSalon.image4) {
//         updatedSalon.image4 = await this.s3_service.get_image_url(updatedSalon.image4);
//       }

//       return new Salon(updatedSalon);
//     } catch (e) {
//       console.log(e);
//       throw new InternalServerErrorException(e);
//     }
//   }
// }

// // const existingSalon = await this.salon_repository.get_salon_by_id(
// //     new Types.ObjectId(salon_payload._id),
// //   );

// //   if (!existingSalon) {
// //     throw new NotFoundException('Salon not found');
// //   }

// //   // Update salon data
// //   return await this.salon_repository.update(existingSalon.id, createSalonDto);
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
import { SalonStatus } from './enums/salon_status.enum';
import { Roles } from 'src/auth/enums/roles.enum';

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
    salon_id?: string,
  ) {
    try {
      const role = salon_payload.role;
      let targetSalonId: string;

      if (role === Roles.SUPERADMIN) {
        if (!salon_id) {
          throw new BadRequestException('salon_id is required for SUPERADMIN');
        }
        if (!Types.ObjectId.isValid(salon_id)) {
          throw new BadRequestException('Invalid salon_id');
        }
        targetSalonId = salon_id;
      } else if (role === Roles.SALON) {
        if (salon_id) {
          throw new BadRequestException('salon_id is not allowed for SALON role');
        }
        targetSalonId = salon_payload._id;
      } else {
        throw new BadRequestException('Unauthorized role');
      }

      console.log(update_salon_Dto, 'lol');
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
      const path = SalonService.GET_SALON_IMAGE_PATH(targetSalonId);
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
        new Types.ObjectId(targetSalonId),
        update_obj,
      );
      if (!salon) {
        throw new BadRequestException('Salon could not be updated');
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

  async getAllSalon(query: any) {
    const filter: any = {};

    if (query.salon_name) {
      filter.salon_name = { $regex: new RegExp(query.salon_name, 'i') };
    }

    const page = parseInt(query.page_no, 10) || 1;
    let ser = await this.salon_repository.get_all_salons(filter, page);
    ser.salons = await Promise.all(
      ser.salons.map(async (e: any) => {
        e._id = e._id.toString();
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
      }),
    );
    console.log(ser);
    return ser;
  }

  async getSalonById(query: any) {
    const ser = await this.salon_repository.get_salon_by_id(query.id);
    if (!ser) {
      throw new NotFoundException('Salon not found');
    }
    const salon = {
      ...ser,
      _id: ser._id.toString(),
    };
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
    console.log(salon);
    return salon;
  }

  async deleteSalon(salon_payload: AuthPayload, salon_id?: string) {
    try {
      const role = salon_payload.role;
      let targetSalonId: string;

      if (role === Roles.SUPERADMIN) {
        if (!salon_id) {
          throw new BadRequestException('salon_id is required for SUPERADMIN');
        }
        if (!Types.ObjectId.isValid(salon_id)) {
          throw new BadRequestException('Invalid salon_id');
        }
        targetSalonId = salon_id;
      } else if (role === Roles.SALON) {
        if (salon_id) {
          throw new BadRequestException('salon_id is not allowed for SALON role');
        }
        targetSalonId = salon_payload._id;
      } else {
        throw new BadRequestException('Unauthorized role');
      }

      const salon = await this.salon_repository.get_salon_by_id(targetSalonId);
      if (!salon) {
        throw new NotFoundException('Salon not found');
      }

      const imageKeys = [salon.image1, salon.image2, salon.image3, salon.image4].filter(
        (image): image is string => !!image,
      );
      console.log('Image keys:', imageKeys);
      if (imageKeys.length > 0) {
        const imageUrls = await Promise.all(
          imageKeys.map((key) => this.s3_service.get_image_url(key)),
        );
        console.log('Image URLs:', imageUrls);
        await Promise.all(
          imageUrls.map((url) => this.s3_service.deleteFileByUrl(url)),
        );
      }

      const result = await this.salon_repository.delete_salon_by_id(
        new Types.ObjectId(targetSalonId),
      );
      if (result.deletedCount === 0) {
        throw new BadRequestException('Salon could not be deleted');
      }

      return { message: 'Salon deleted successfully' };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async updateSalonStatus(status: SalonStatus, salon_payload: AuthPayload, salon_id?: string): Promise<Salon> {
    try {
      const role = salon_payload.role;
      let targetSalonId: string;

      if (role === Roles.SUPERADMIN) {
        if (!salon_id) {
          throw new BadRequestException('salon_id is required for SUPERADMIN');
        }
        if (!Types.ObjectId.isValid(salon_id)) {
          throw new BadRequestException('Invalid salon_id');
        }
        targetSalonId = salon_id;
      } else if (role === Roles.SALON) {
        if (salon_id) {
          throw new BadRequestException('salon_id is not allowed for SALON role');
        }
        targetSalonId = salon_payload._id;
      } else {
        throw new BadRequestException('Unauthorized role');
      }

      if (!Object.values(SalonStatus).includes(status)) {
        throw new BadRequestException('Invalid status value');
      }

      const salon = await this.salon_repository.get_salon_by_id(targetSalonId);
      if (!salon) {
        throw new BadRequestException('Salon not found');
      }

      const updatedSalon = await this.salon_repository.update_salon(
        new Types.ObjectId(targetSalonId),
        { status },
      );
      if (!updatedSalon) {
        throw new BadRequestException('Salon status could not be updated');
      }

      if (updatedSalon.image1) {
        updatedSalon.image1 = await this.s3_service.get_image_url(updatedSalon.image1);
      }
      if (updatedSalon.image2) {
        updatedSalon.image2 = await this.s3_service.get_image_url(updatedSalon.image2);
      }
      if (updatedSalon.image3) {
        updatedSalon.image3 = await this.s3_service.get_image_url(updatedSalon.image3);
      }
      if (updatedSalon.image4) {
        updatedSalon.image4 = await this.s3_service.get_image_url(updatedSalon.image4);
      }

      return new Salon(updatedSalon);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }
}