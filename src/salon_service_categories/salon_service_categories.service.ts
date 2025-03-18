import { Injectable } from '@nestjs/common';
import {
  CreateSalonServiceCategoriesDto,
  UpdateSalonServiceCategoriesDto,
} from './dto/salon_service_categories.dto';
import { SalonServicesCategoriesRepository } from './salon_service_categories.repository';

@Injectable()
export class SalonServiceCategoriesService {
  constructor(
    private readonly salonServicesRepository: SalonServicesCategoriesRepository,
  ) {}

  async create(createSalonServiceDto: CreateSalonServiceCategoriesDto) {
    return await this.salonServicesRepository.create(createSalonServiceDto);
  }

  async findAll() {
    return await this.salonServicesRepository.findAll();
  }

  async findOne(id: string) {
    return await this.salonServicesRepository.findById(id);
  }

  async update(
    id: string,
    updateSalonServiceDto: UpdateSalonServiceCategoriesDto,
  ) {
    return await this.salonServicesRepository.update(id, updateSalonServiceDto);
  }

  async remove(id: string) {
    return await this.salonServicesRepository.delete(id);
  }
}
