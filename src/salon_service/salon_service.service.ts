import { Injectable, NotFoundException } from '@nestjs/common';
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
import { Salon } from 'src/schemas/salon/salon.schema';
import { AuthPayload } from 'src/auth/payloads/auth.payload';

@Injectable()
export class SalonServicesService {
  constructor(
    private readonly salonServicesRepository: SalonServicesRepository,
        private s3_service: S3Service,
  ) {}
  private static readonly GET_SALON_SERVICE_IMAGE_PATH = (id: string) => {
    return 'glimmer/brands/' + id + '/salon_services_images';
  };
  async create(
    createSalonServiceDto: CreateSalonServiceDto,
    salon_payload:AuthPayload
  ): Promise<SalonService> {
    const path = SalonServicesService.GET_SALON_SERVICE_IMAGE_PATH(salon_payload._id);
    let salon_service_temp: any = structuredClone(createSalonServiceDto);

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
    salon_service_temp.salonId =salon_payload._id;
     const salon_service_new =
     await this.salonServicesRepository.create(salon_service_temp);
    
          if (salon_service_new.image1) {
            salon_service_new.image1 = await this.s3_service.get_image_url(salon_service_new.image1);
          }
          if (salon_service_new.image2) {
            salon_service_new.image2 = await this.s3_service.get_image_url(salon_service_new.image2);
          }
          if (salon_service_new.image3) {
            salon_service_new.image3 = await this.s3_service.get_image_url(salon_service_new.image3);
          }
    
       return salon_service_new
    
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
    let ser=await this.salonServicesRepository.findAll(filter, page)
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
      })
    );
    
    return ser;
  }

  async findAllServices(query: any,salon_payload?:AuthPayload) {
    const filter: any = {};
    if (query.status) {
      filter.priceUpdateStatus = query.status;
    }
    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }

    if (salon_payload?._id) {
      filter.salonId = salon_payload._id;
    }

    if (query.subCategoryName) {
      filter.subCategoryName = query.subCategoryName;
    }

    if (query.subSubCategoryName) {
      filter.subSubCategoryName = query.subSubCategoryName;
    }
    const page = parseInt(query.page_no, 10) || 1;
    let ser=await this.salonServicesRepository.findAll(filter, page)
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
      })
    );
    
    return ser;
  }

  async findOne(id: string): Promise<SalonService> {
    let ser=await this.salonServicesRepository.findById(id);
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
  ): Promise<SalonService> {
    return this.salonServicesRepository.update(
      updateSalonServiceDto.id,
      updateSalonServiceDto,
    );
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
}
