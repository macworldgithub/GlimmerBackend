import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSalonServiceDto } from './dto/create_salon_service.dto';
import {
  SalonService,
  SalonServiceSchema,
} from 'src/schemas/salon/salon_service.schema';
import {
  SalonServiceCategories,
  SalonServiceCategoriesSchema,
} from 'src/schemas/salon/salon_service_categories.schema';
import { Salon, SalonDocument } from 'src/schemas/salon/salon.schema';
import { name } from 'ejs';

@Injectable()
export class SalonServicesRepository {
  constructor(
    @InjectModel(SalonService.name)
    private readonly salonServiceModel: Model<SalonService>,

    @InjectModel(SalonServiceCategories.name)
    private readonly salonServiceCategoriesModel: Model<SalonServiceCategories>,
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

  // async elastic_search(
  //   categoryId?: string,
  //   gender?: string,
  //   service?: string,
  //   price?: number,
  //   name?: string,
  // ): Promise<SalonService[]> {
  //   const andClauses: Record<string, any>[] = [];

  //   if (price != null) {
  //     andClauses.push({ actualPrice: price });
  //   }
  //   if (categoryId) {
  //     andClauses.push({ categoryId: { $regex: categoryId, $options: 'i' } });
  //   }
  //   if (gender) {
  //     andClauses.push({
  //       subCategoryName: { $regex: `^${gender}$`, $options: 'i' },
  //     });
  //   }
  //   if (service) {
  //     andClauses.push({
  //       subSubCategoryName: { $regex: service, $options: 'i' },
  //     });
  //   }
  //   if (name) {
  //     andClauses.push({ name: { $regex: name, $options: 'i' } });
  //   }

  //   const query = andClauses.length ? { $and: andClauses } : {};

  //   return this.salonServiceModel.find(query).lean().exec();
  // }

  async elastic_search(
    nameTerm?: string,
    gender?: string,
    serviceTerm?: string,
    price?: number,
  ): Promise<SalonService[]> {
    // Base filter for gender, serviceTerm, and price
    const baseFilter: Record<string, any> = {};
    if (price != null) {
      baseFilter.actualPrice = price;
    }
    if (gender) {
      baseFilter.$or = [
        { subCategoryName: { $regex: `^${gender}$`, $options: 'i' } },
      ];
    }
    if (serviceTerm) {
      baseFilter.subSubCategoryName = { $regex: serviceTerm, $options: 'i' };
    }

    // Helper to enrich with categoryName
    const enrichWithCategory = async (services: SalonService[]) => {
      const catIds = [...new Set(services.map((s) => s.categoryId.toString()))];
      const categories = await this.salonServiceCategoriesModel
        .find({ _id: { $in: catIds.map((id) => new Types.ObjectId(id)) } })
        .lean()
        .exec();
      const categoryMap = new Map<string, string>();
      categories.forEach((c) => categoryMap.set(c._id.toString(), c.category));
      return services.map((s) => ({
        ...s,
        categoryName: categoryMap.get(s.categoryId.toString()) || null,
      }));
    };

    // If no nameTerm, fetch and enrich
    if (!nameTerm) {
      const services = await this.salonServiceModel
        .find(baseFilter)
        .lean()
        .exec();
      return enrichWithCategory(services);
    }

    // Map to dedupe results by _id
    const resultsMap = new Map<string, SalonService>();

    // 1) Direct service name matches
    const directMatches = await this.salonServiceModel
      .find({
        ...baseFilter,
        name: { $regex: nameTerm, $options: 'i' },
      })
      .lean()
      .exec();
    directMatches.forEach((doc) => resultsMap.set(doc._id.toString(), doc));

    // 2) Category name matches => fetch corresponding services
    const matchedCategories = await this.salonServiceCategoriesModel
      .find({ category: { $regex: nameTerm, $options: 'i' } })
      .lean()
      .exec();
    if (matchedCategories.length) {
      const catIds = matchedCategories.map((c) => c._id);
      const categoryMatches = await this.salonServiceModel
        .find({
          ...baseFilter,
          categoryId: { $in: catIds.map((id) => new Types.ObjectId(id)) },
        })
        .lean()
        .exec();
      categoryMatches.forEach((doc) => resultsMap.set(doc._id.toString(), doc));
    }

    // Return combined, deduped, and enriched results
    return enrichWithCategory(Array.from(resultsMap.values()));
  }
}
