// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { CreateSalonServiceDto } from './dto/create_salon_service.dto';
// import { SalonService } from 'src/schemas/salon/salon_service.schema';

// @Injectable()
// export class SalonServicesRepository {
//   constructor(
//     @InjectModel(SalonService.name)
//     private readonly salonServiceModel: Model<SalonService>,
//   ) {}

//   async create(
//     createSalonServiceDto: CreateSalonServiceDto,
//   ): Promise<SalonService> {
//     const newService = new this.salonServiceModel(createSalonServiceDto);
//     return newService.save();
//   }

//   async findAll(): Promise<SalonService[]> {
//     return this.salonServiceModel.find().exec();
//   }

//   /**
//    * Find a service by ID
//    */
//   async findById(id: string): Promise<SalonService> {
//     const service = await this.salonServiceModel.findById(id).exec();
//     if (!service) {
//       throw new NotFoundException(`Salon Service with ID ${id} not found`);
//     }
//     return service;
//   }

//   /**
//    * Update a service by ID
//    */
//   async update(id: string, updateSalonServiceDto: any): Promise<SalonService> {
//     const updatedService = await this.salonServiceModel
//       .findByIdAndUpdate(id, updateSalonServiceDto, {
//         new: true,
//       })
//       .exec();

//     if (!updatedService) {
//       throw new NotFoundException(`Salon Service with ID ${id} not found`);
//     }

//     return updatedService;
//   }

//   /**
//    * Request a price update for a service (requires admin approval)
//    */
//   async requestPriceUpdate(
//     id: string,
//     requestedPrice: number,
//   ): Promise<SalonService> {
//     const service = await this.findById(id);
//     service.requestedPrice = requestedPrice;
//     service.priceUpdateStatus = 'pending';
//     return service.save();
//   }

//   /**
//    * Approve or reject a price update request (Admin only)
//    */
//   async approvePriceUpdate(
//     id: string,
//     status: 'approved' | 'rejected',
//   ): Promise<SalonService> {
//     const service = await this.findById(id);
//     if (status === 'approved') {
//       service.adminSetPrice = service.requestedPrice;
//     }
//     service.priceUpdateStatus = status;
//     service.requestedPrice = undefined;
//     return service.save();
//   }

//   /**
//    * Apply a discount to a specific service
//    */
//   async applyDiscount(
//     id: string,
//     discountPercentage: number,
//   ): Promise<SalonService> {
//     const service = await this.findById(id);
//     service.hasDiscount = true;
//     service.discountPercentage = discountPercentage;
//     return service.save();
//   }

//   /**
//    * Remove discount from a specific service
//    */
//   async removeDiscount(id: string): Promise<SalonService> {
//     const service = await this.findById(id);
//     service.hasDiscount = false;
//     service.discountPercentage = 0;
//     return service.save();
//   }

//   /**
//    * Apply a global discount to all services
//    */
//   async applyGlobalDiscount(discountPercentage: number): Promise<void> {
//     await this.salonServiceModel
//       .updateMany({}, { hasDiscount: true, discountPercentage })
//       .exec();
//   }

//   /**
//    * Remove global discount from all services
//    */
//   async removeGlobalDiscount(): Promise<void> {
//     await this.salonServiceModel
//       .updateMany({}, { hasDiscount: false, discountPercentage: 0 })
//       .exec();
//   }

//   /**
//    * Delete a service by ID
//    */
//   async delete(id: string): Promise<void> {
//     const deletedService = await this.salonServiceModel
//       .findByIdAndDelete(id)
//       .exec();
//     if (!deletedService) {
//       throw new NotFoundException(`Salon Service with ID ${id} not found`);
//     }
//   }
// }
