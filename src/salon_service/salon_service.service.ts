import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SalonServicesRepository } from './salon_service.repository';
import {
  CreateSalonServiceDto,
  UpdateSalonServiceDto,
  RequestPriceUpdateDto,
  ApprovePriceUpdateDto,
  ApplyDiscountDto,
  RemoveDiscountDto,
  ApplyBulkDiscountDto,
} from './dto/create_salon_service.dto';
import { S3Service } from 'src/aws/s3.service';
import { SalonService } from 'src/schemas/salon/salon_service.schema';
import { Salon, SalonSchema } from 'src/schemas/salon/salon.schema';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { ProductFiles } from 'src/product/types/update_product.type';
import { SalonRepository } from 'src/salon/salon.repository';
import slugify from 'slugify';

@Injectable()
export class SalonServicesService {
  constructor(
    private readonly salonServicesRepository: SalonServicesRepository,
    private readonly salonRepository: SalonRepository,

    private s3_service: S3Service,
  ) {}
  private static readonly GET_SALON_SERVICE_IMAGE_PATH = (id: string) => {
    return 'glimmer/brands/' + id + '/salon_services_images';
  };
  async create(
    createSalonServiceDto: CreateSalonServiceDto,
    salon_payload: AuthPayload,
  ): Promise<SalonService> {
    const path = SalonServicesService.GET_SALON_SERVICE_IMAGE_PATH(
      salon_payload._id,
    );
    let salon_service_temp: any = structuredClone(createSalonServiceDto);
    if (salon_service_temp.name) {
      salon_service_temp.slug = slugify(salon_service_temp.name, {
        lower: true,
        strict: true,
      });
    }
    if (createSalonServiceDto.image1) {
      salon_service_temp.image1 = (
        await this.s3_service.upload_file(createSalonServiceDto.image1, path)
      ).Key;
    }
    if (createSalonServiceDto.image2) {
      salon_service_temp.image2 = (
        await this.s3_service.upload_file(createSalonServiceDto.image2, path)
      ).Key;
    }
    if (createSalonServiceDto.image3) {
      salon_service_temp.image3 = (
        await this.s3_service.upload_file(createSalonServiceDto.image3, path)
      ).Key;
    }
    salon_service_temp.salonId = salon_payload._id;
    const salon_service_new =
      await this.salonServicesRepository.create(salon_service_temp);

    if (salon_service_new.image1) {
      salon_service_new.image1 = await this.s3_service.get_image_url(
        salon_service_new.image1,
      );
    }
    if (salon_service_new.image2) {
      salon_service_new.image2 = await this.s3_service.get_image_url(
        salon_service_new.image2,
      );
    }
    if (salon_service_new.image3) {
      salon_service_new.image3 = await this.s3_service.get_image_url(
        salon_service_new.image3,
      );
    }

    return salon_service_new;
  }

  async findAllActive(query: any) {
    const filter: any = { priceUpdateStatus: 'assigned', status: true };

    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }

    if (query.salonId) {
      filter.salonId = query.salonId;
    }

    if (query.subCategoryName) {
      filter.subCategoryName = query.subCategoryName;
    }

    if (query.subSubCategoryName) {
      filter.subSubCategoryName = query.subSubCategoryName;
    }
    const page = parseInt(query.page_no, 10) || 1;

    const sortBy = query.sortBy;
    const order: 'asc' | 'desc' = query.order === 'asc' ? 'asc' : 'desc';

    let ser = await this.salonServicesRepository.findAll(
      filter,
      page,
      sortBy,
      order,
    );
    ser.services = await Promise.all(
      ser.services.map(async (e) => {
        if (e.image1) {
          e.image1 = await this.s3_service.get_image_url(e.image1);
        }
        if (e.image2) {
          e.image2 = await this.s3_service.get_image_url(e.image2);
        }
        if (e.image3) {
          e.image3 = await this.s3_service.get_image_url(e.image3);
        }
        return e;
      }),
    );

    return ser;
  }

  async findAllServices(query: any, salon_payload?: AuthPayload) {
    const filter: any = {};
    if (query.status) {
      filter.priceUpdateStatus = query.status;
    }
    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }

    if (query.salonId) {
      filter.salonId = query.salonId;
    }
    console.log(salon_payload?._id);
    if (salon_payload?._id) {
      filter.salonId = salon_payload._id;
    }

    if (query.subCategoryName) {
      filter.subCategoryName = query.subCategoryName;
    }

    if (query.subSubCategoryName) {
      filter.subSubCategoryName = query.subSubCategoryName;
    }

    if (query.name) {
      filter.name = { $regex: new RegExp(query.name, 'i') };
    }
    const page = parseInt(query.page_no, 10) || 1;
    let ser = await this.salonServicesRepository.findAll(filter, page);
    ser.services = await Promise.all(
      ser.services.map(async (e) => {
        if (e.image1) {
          e.image1 = await this.s3_service.get_image_url(e.image1);
        }
        if (e.image2) {
          e.image2 = await this.s3_service.get_image_url(e.image2);
        }
        if (e.image3) {
          e.image3 = await this.s3_service.get_image_url(e.image3);
        }
        return e;
      }),
    );

    return ser;
  }

  async findOne(id: string): Promise<SalonService> {
    let ser = await this.salonServicesRepository.findById(id);
    if (ser.image1) {
      ser.image1 = await this.s3_service.get_image_url(ser.image1);
    }
    if (ser.image2) {
      ser.image2 = await this.s3_service.get_image_url(ser.image2);
    }
    if (ser.image3) {
      ser.image3 = await this.s3_service.get_image_url(ser.image3);
    }

    return ser;
  }
  async changeActivationStatus(id: string) {
    let a = await this.salonServicesRepository.findById(id);
    return this.salonServicesRepository.update(id, { status: !a.status });
  }

  async update(
    updateSalonServiceDto: UpdateSalonServiceDto,
    files: ProductFiles,
    store_payload: AuthPayload,
  ) {
    const salon_service = await this.salonServicesRepository.findById(
      updateSalonServiceDto.id,
    );
    if (!salon_service) throw new BadRequestException('Service not found');

    const path = SalonServicesService.GET_SALON_SERVICE_IMAGE_PATH(
      store_payload._id,
    );
    let service_temp: any = structuredClone(updateSalonServiceDto);
    if (files?.image1?.length) {
      if (salon_service.image1) {
        service_temp.image1 = (
          await this.s3_service.upload_file_by_key(
            files.image1[0],
            salon_service.image1,
          )
        ).Key;
      } else {
        service_temp.image1 = (
          await this.s3_service.upload_file(files.image1[0], path)
        ).Key;
      }
    } else {
      delete service_temp.image1;
    }
    if (files?.image2?.length) {
      if (salon_service.image2) {
        service_temp.image2 = (
          await this.s3_service.upload_file_by_key(
            files.image2[0],
            salon_service.image2,
          )
        ).Key;
      } else {
        service_temp.image2 = (
          await this.s3_service.upload_file(files.image2[0], path)
        ).Key;
      }
    } else {
      delete service_temp.image2;
    }
    if (files?.image3?.length) {
      if (salon_service.image3) {
        service_temp.image3 = (
          await this.s3_service.upload_file_by_key(
            files.image3[0],
            salon_service.image3,
          )
        ).Key;
      } else {
        service_temp.image3 = (
          await this.s3_service.upload_file(files.image3[0], path)
        ).Key;
      }
    } else {
      delete service_temp.image3;
    }
    Object.keys(service_temp).forEach((key) => {
      if (service_temp[key] === '' || key === 'id') {
        delete service_temp[key];
      }
    });
    console.log(updateSalonServiceDto, 'updateSalonServiceDto', service_temp);
    let serv = await this.salonServicesRepository.update(
      updateSalonServiceDto.id,
      service_temp,
    );
    if (!serv) {
      throw new BadRequestException('service doesnot exist');
    }
    if (serv.image1) {
      serv.image1 = await this.s3_service.get_image_url(serv.image1);
    }
    if (serv.image2) {
      serv.image2 = await this.s3_service.get_image_url(serv.image2);
    }
    if (serv.image3) {
      serv.image3 = await this.s3_service.get_image_url(serv.image3);
    }
    return serv;
  }

  async requestPriceUpdate(requestDto: RequestPriceUpdateDto) {
    return this.salonServicesRepository.requestPriceUpdate(
      requestDto.id,
      requestDto.requestedPrice,
    );
  }

  async approvePriceUpdate(approveDto: ApprovePriceUpdateDto) {
    return this.salonServicesRepository.approvePriceUpdate(
      approveDto.id,
      approveDto.adminSetPrice,
    );
  }

  async applyDiscount(applyDiscountDto: ApplyDiscountDto) {
    await this.salonServicesRepository.applyDiscount(
      applyDiscountDto.id,
      applyDiscountDto.discountPercentage,
    );
  }
  async applyBulkDiscount(applyDiscountDto: ApplyBulkDiscountDto) {
    await this.salonServicesRepository.applyBulkDiscount(
      applyDiscountDto.id,
      applyDiscountDto.discountPercentage,
    );
  }

  async removeDiscount(data: RemoveDiscountDto) {
    await this.salonServicesRepository.removeDiscount(data.id);
  }

  async remove(id: string): Promise<void> {
    await this.salonServicesRepository.delete(id);
  }

  async elasticSearch(
    nameTerm?: string,
    gender?: string,
    serviceTerm?: string,
    price?: number,
  ): Promise<SalonService[]> {
    return await this.salonServicesRepository.elastic_search(
      nameTerm,
      gender,
      serviceTerm,
      price,
    );
  }

  async getServiceBySlug(serviceSlug: string): Promise<SalonService | null> {
    return this.salonServicesRepository.findByServiceSlug(serviceSlug);
  }
}
