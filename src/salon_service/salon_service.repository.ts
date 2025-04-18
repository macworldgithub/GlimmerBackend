import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSalonServiceDto } from './dto/create_salon_service.dto';
import { SalonService } from 'src/schemas/salon/salon_service.schema';

@Injectable()
export class SalonServicesRepository {
  constructor(
    @InjectModel(SalonService.name)
    private readonly salonServiceModel: Model<SalonService>,
  ) {}

  async create(
    createSalonServiceDto: CreateSalonServiceDto,
  ): Promise<SalonService> {
    const newService = new this.salonServiceModel(createSalonServiceDto);
    return newService.save();
  }

  async findAll(filter: any, page: any) {
    const limit = 10;
    const skip = (page - 1) * limit;
    const total = await this.salonServiceModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);
    let services = await this.salonServiceModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    return {
      services,
      total,
      currentPage: page,
      totalPages,
    };
  }

  async findById(id: string): Promise<SalonService> {
    const service = await this.salonServiceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException(`Salon Service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: string, updateSalonServiceDto: any): Promise<SalonService> {
    const updatedService = await this.salonServiceModel
      .findByIdAndUpdate(id, updateSalonServiceDto, {
        new: true,
      })
      .exec();

    if (!updatedService) {
      throw new NotFoundException(`Salon Service with ID ${id} not found`);
    }

    return updatedService;
  }

  async requestPriceUpdate(id: string, requestedPrice: number) {
    const service = await this.salonServiceModel
      .findByIdAndUpdate(
        id,
        {
          requestedPrice: requestedPrice,
          actualPrice: 0,
          priceUpdateStatus: 'pending',
        },
        {
          new: true,
        },
      )
      .exec();
    return service;
  }

  async approvePriceUpdate(id: string, adminSetPrice: number) {
    const service = await this.salonServiceModel
      .findByIdAndUpdate(
        id,
        {
          adminSetPrice: adminSetPrice,
          actualPrice: adminSetPrice,
          priceUpdateStatus: 'assigned',
        },
        {
          new: true,
        },
      )
      .exec();
    return service;
  }

  async applyBulkDiscount(id: string[], discountPercentage: any) {
    const service = await this.salonServiceModel
      .updateMany(
        { _id: { $in: id } },
        {
          $set: {
            discountPercentage: discountPercentage,
            hasDiscount: true,
          },
        },
      )
      .exec();

    return service;
  }
  async applyDiscount(id: string, discountPercentage: any) {
    console.log(discountPercentage, id);
    const service = await this.salonServiceModel
      .findByIdAndUpdate(
        id,
        {
          discountPercentage: parseFloat(discountPercentage),
          hasDiscount: true,
        },
        {
          new: true,
        },
      )
      .exec();
    return service;
  }

  async removeDiscount(id: string) {
    const service = await this.salonServiceModel
      .findByIdAndUpdate(
        id,
        {
          discountPercentage: 0,
          hasDiscount: false,
        },
        {
          new: true,
        },
      )
      .exec();
    return service;
  }

  //   async applyGlobalDiscount(discountPercentage: number): Promise<void> {
  //     await this.salonServiceModel
  //       .updateMany({}, { hasDiscount: true, discountPercentage })
  //       .exec();
  //   }

  //   async removeGlobalDiscount(): Promise<void> {
  //     await this.salonServiceModel
  //       .updateMany({}, { hasDiscount: false, discountPercentage: 0 })
  //       .exec();
  //   }

  async delete(id: string): Promise<void> {
    const deletedService = await this.salonServiceModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedService) {
      throw new NotFoundException(`Salon Service with ID ${id} not found`);
    }
  }
}
