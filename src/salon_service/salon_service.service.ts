import { Injectable, NotFoundException } from '@nestjs/common';
import { SalonServicesRepository } from './salon_service.repository';
import {
  CreateSalonServiceDto,
  UpdateSalonServiceDto,
  RequestPriceUpdateDto,
  ApprovePriceUpdateDto,
  ApplyDiscountDto,
  RemoveDiscountDto,
} from './dto/create_salon_service.dto';
import { SalonService } from 'src/schemas/salon/salon_service.schema';

@Injectable()
export class SalonServicesService {
  constructor(
    private readonly salonServicesRepository: SalonServicesRepository,
  ) {}

  async create(
    createSalonServiceDto: CreateSalonServiceDto,
  ): Promise<SalonService> {
    return this.salonServicesRepository.create(createSalonServiceDto);
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
    return this.salonServicesRepository.findAll(filter, page);
  }

  async findAllServices(query: any) {
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

    if (query.subCategoryName) {
      filter.subCategoryName = query.subCategoryName;
    }

    if (query.subSubCategoryName) {
      filter.subSubCategoryName = query.subSubCategoryName;
    }
    const page = parseInt(query.page_no, 10) || 1;
    return this.salonServicesRepository.findAll(filter, page);
  }

  async findOne(id: string): Promise<SalonService> {
    return this.salonServicesRepository.findById(id);
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

  async removeDiscount(data: RemoveDiscountDto) {
    await this.salonServicesRepository.removeDiscount(data.id);
  }

  async remove(id: string): Promise<void> {
    await this.salonServicesRepository.delete(id);
  }
}
