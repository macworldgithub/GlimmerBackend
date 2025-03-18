import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateSalonServiceDto,
  UpdateSalonServiceDto,
} from './dto/salon-services.dto';
import { SalonServiceCategories } from 'src/schemas/salon/salon_service.schema';

@Injectable()
export class SalonServicesService {
  constructor(
    @InjectModel(SalonServiceCategories.name)
    private salonServiceModel: Model<SalonServiceDocument>,
  ) {}

  async create(
    createSalonServiceDto: CreateSalonServiceDto,
  ): Promise<SalonService> {
    const newService = new this.salonServiceModel(createSalonServiceDto);
    return newService.save();
  }

  async findAll(): Promise<SalonService[]> {
    return this.salonServiceModel.find().exec();
  }

  async findOne(id: string): Promise<SalonService> {
    const service = await this.salonServiceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException(`Salon Service with ID ${id} not found`);
    }
    return service;
  }

  async update(
    id: string,
    updateSalonServiceDto: UpdateSalonServiceDto,
  ): Promise<SalonService> {
    const updatedService = await this.salonServiceModel.findByIdAndUpdate(
      id,
      updateSalonServiceDto,
      { new: true },
    );
    if (!updatedService) {
      throw new NotFoundException(`Salon Service with ID ${id} not found`);
    }
    return updatedService;
  }

  async remove(id: string): Promise<void> {
    const deletedService = await this.salonServiceModel.findByIdAndDelete(id);
    if (!deletedService) {
      throw new NotFoundException(`Salon Service with ID ${id} not found`);
    }
  }
}
