// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import {
//   CreateSalonServiceDto,
//   UpdateSalonServiceDto,
// } from './dto/salon_service.dto';

// @Injectable()
// export class SalonServicesRepository {
//   constructor(
//     @InjectModel(SalonService.name)
//     private readonly salonServiceModel: Model<SalonServiceDocument>,
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

//   async findById(id: string): Promise<SalonService> {
//     const service = await this.salonServiceModel.findById(id).exec();
//     if (!service) {
//       throw new NotFoundException(`Salon Service with ID ${id} not found`);
//     }
//     return service;
//   }

//   async update(
//     id: string,
//     updateSalonServiceDto: UpdateSalonServiceDto,
//   ): Promise<SalonService> {
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

//   async delete(id: string): Promise<void> {
//     const deletedService = await this.salonServiceModel
//       .findByIdAndDelete(id)
//       .exec();
//     if (!deletedService) {
//       throw new NotFoundException(`Salon Service with ID ${id} not found`);
//     }
//   }
// }
