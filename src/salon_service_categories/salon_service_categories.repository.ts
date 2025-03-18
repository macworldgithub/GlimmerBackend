import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateSalonServiceCategoriesDto,
  UpdateSalonServiceCategoriesDto,
} from './dto/salon_service_categories.dto';
import { SalonServiceCategories } from 'src/schemas/salon/salon_service_categories.schema';

@Injectable()
export class SalonServicesCategoriesRepository {
  constructor(
    @InjectModel(SalonServiceCategories.name)
    private readonly salon_service_catgeories_model: Model<SalonServiceCategories>,
  ) {}

  async create(createSalonServiceDto: CreateSalonServiceCategoriesDto) {
    const newService = new this.salon_service_catgeories_model(
      createSalonServiceDto,
    );
    return newService.save();
  }

  async findAll() {
    return this.salon_service_catgeories_model
      .find()
      .select('category')
      .lean()
      .exec();
  }

  async findById(id: string) {
    const service = await this.salon_service_catgeories_model
      .findById(id)
      .exec();
    if (!service) {
      throw new NotFoundException(`Salon Service with ID ${id} not found`);
    }
    return service;
  }

  async update(
    id: string,
    updateSalonServiceDto: UpdateSalonServiceCategoriesDto,
  ) {
    const updatedService = await this.salon_service_catgeories_model
      .findByIdAndUpdate(id, updateSalonServiceDto, {
        new: true,
      })
      .exec();
    if (!updatedService) {
      throw new NotFoundException(`Salon Service with ID ${id} not found`);
    }
    return updatedService;
  }

  async delete(id: string): Promise<void> {
    const deletedService = await this.salon_service_catgeories_model
      .findByIdAndDelete(id)
      .exec();
    if (!deletedService) {
      throw new NotFoundException(`Salon Service with ID ${id} not found`);
    }
  }
}
