import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSalonServiceDto } from './dto/create_salon_service.dto';
import {
  SalonService,
  SalonServiceSchema,
} from 'src/schemas/salon/salon_service.schema';
import { S3Service } from 'src/aws/s3.service';
import {
  SalonServiceCategories,
  SalonServiceCategoriesSchema,
} from 'src/schemas/salon/salon_service_categories.schema';
import { Salon, SalonDocument } from 'src/schemas/salon/salon.schema';
import { name } from 'ejs';
import { BadRequestException } from '@nestjs/common';
@Injectable()
export class SalonServicesRepository {
  constructor(
    @InjectModel(SalonService.name)
    private readonly salonServiceModel: Model<SalonService>,

    @InjectModel(SalonServiceCategories.name)
    private readonly salonServiceCategoriesModel: Model<SalonServiceCategories>,
    @InjectModel(Salon.name)
    private readonly salonModel: Model<SalonDocument>,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createSalonServiceDto: CreateSalonServiceDto,
  ): Promise<SalonService> {
    const newService = new this.salonServiceModel(createSalonServiceDto);
    return newService.save();
  }

  async findAll(
    filter: any,
    page: any,
    sortBy?: string,
    order: 'asc' | 'desc' = 'desc',
  ) {
    const limit = 10;
    const skip = (page - 1) * limit;

    const sortOptions: any = getSortOptions(sortBy, order);

    const total = await this.salonServiceModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);
    let services = await this.salonServiceModel
      .find(filter)
      .sort(sortOptions)
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

  async findByServiceSlug(serviceSlug: string): Promise<SalonService | null> {
    return this.salonServiceModel.findOne({ slug: serviceSlug, status: true });
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
  async applyDiscount(id: string, discountPercentage: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid service ID: ${id}`);
    }

    console.log('Applying discount:', { id, discountPercentage });
    const service = await this.salonServiceModel
      .findByIdAndUpdate(
        id,
        {
          discountPercentage: parseFloat(discountPercentage),
          hasDiscount: true,
        },
        { new: true },
      )
      .exec();

    if (!service) {
      throw new NotFoundException(`Salon Service with ID ${id} not found`);
    }

    return service;
  }

  async applyBulkDiscount(id: string[], discountPercentage: any) {
    const invalidIds = id.filter((id) => !Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid service IDs: ${invalidIds.join(', ')}`,
      );
    }

    console.log(
      'Applying bulk discount to IDs:',
      id,
      'Discount:',
      discountPercentage,
    );
    const result = await this.salonServiceModel
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

    if (result.modifiedCount === 0) {
      throw new NotFoundException(
        `No services found with IDs: ${id.join(', ')}`,
      );
    }

    return { message: `Updated ${result.modifiedCount} services`, result };
  }
  // async applyBulkDiscount(id: string[], discountPercentage: any) {
  //   const service = await this.salonServiceModel
  //     .updateMany(
  //       { _id: { $in: id } },
  //       {
  //         $set: {
  //           discountPercentage: discountPercentage,
  //           hasDiscount: true,
  //         },
  //       },
  //     )
  //     .exec();

  //   return service;
  // }
  // async applyDiscount(id: string, discountPercentage: any) {
  //   console.log(discountPercentage, id);
  //   const service = await this.salonServiceModel
  //     .findByIdAndUpdate(
  //       id,
  //       {
  //         discountPercentage: parseFloat(discountPercentage),
  //         hasDiscount: true,
  //       },
  //       {
  //         new: true,
  //       },
  //     )
  //     .exec();
  //   return service;
  // }

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

  // async elastic_search(
  //   nameTerm?: string,
  //   gender?: string,
  //   serviceTerm?: string,
  //   price?: number,
  // ): Promise<SalonService[]> {
  //   // Base filter for gender, serviceTerm, and price
  //   const baseFilter: Record<string, any> = {};
  //   if (price != null) {
  //     baseFilter.actualPrice = price;
  //   }
  //   if (gender) {
  //     baseFilter.$or = [
  //       { subCategoryName: { $regex: `^${gender}$`, $options: 'i' } },
  //     ];
  //   }
  //   if (serviceTerm) {
  //     baseFilter.subSubCategoryName = { $regex: serviceTerm, $options: 'i' };
  //   }

  //   // Helper to enrich with categoryName
  //   const enrichWithCategory = async (services: SalonService[]) => {
  //     const catIds = [...new Set(services.map((s) => s.categoryId.toString()))];
  //     const categories = await this.salonServiceCategoriesModel
  //       .find({ _id: { $in: catIds.map((id) => new Types.ObjectId(id)) } })
  //       .lean()
  //       .exec();
  //     const categoryMap = new Map<string, string>();
  //     categories.forEach((c) => categoryMap.set(c._id.toString(), c.category));
  //     return services.map((s) => ({
  //       ...s,
  //       categoryName: categoryMap.get(s.categoryId.toString()) || null,
  //     }));
  //   };

  //   // If no nameTerm, fetch and enrich
  //   if (!nameTerm) {
  //     const services = await this.salonServiceModel
  //       .find(baseFilter)
  //       .lean()
  //       .exec();
  //     return enrichWithCategory(services);
  //   }

  //   // Map to dedupe results by _id
  //   const resultsMap = new Map<string, SalonService>();

  //   // 1) Direct service name matches
  //   const directMatches = await this.salonServiceModel
  //     .find({
  //       ...baseFilter,
  //       name: { $regex: nameTerm, $options: 'i' },
  //     })
  //     .lean()
  //     .exec();
  //   directMatches.forEach((doc) => resultsMap.set(doc._id.toString(), doc));

  //   // 2) Category name matches => fetch corresponding services
  //   const matchedCategories = await this.salonServiceCategoriesModel
  //     .find({ category: { $regex: nameTerm, $options: 'i' } })
  //     .lean()
  //     .exec();
  //   if (matchedCategories.length) {
  //     const catIds = matchedCategories.map((c) => c._id);
  //     const categoryMatches = await this.salonServiceModel
  //       .find({
  //         ...baseFilter,
  //         categoryId: { $in: catIds.map((id) => new Types.ObjectId(id)) },
  //       })
  //       .lean()
  //       .exec();
  //     categoryMatches.forEach((doc) => resultsMap.set(doc._id.toString(), doc));
  //   }

  //   // Return combined, deduped, and enriched results
  //   return enrichWithCategory(Array.from(resultsMap.values()));
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

    // Helper to enrich with categoryName, salonName, and signed URLs
    const enrichWithCategoryAndSignedUrls = async (
      services: SalonService[],
    ) => {
      // Enrich with categoryName
      const catIds = [...new Set(services.map((s) => s.categoryId.toString()))];
      const categories = await this.salonServiceCategoriesModel
        .find({ _id: { $in: catIds.map((id) => new Types.ObjectId(id)) } })
        .lean()
        .exec();
      const categoryMap = new Map<string, string>();
      categories.forEach((c) => categoryMap.set(c._id.toString(), c.category));

      // Enrich with salonName
      const salonIds = [...new Set(services.map((s) => s.salonId.toString()))];
      const salons = await this.salonModel
        .find({ _id: { $in: salonIds.map((id) => new Types.ObjectId(id)) } })
        .lean()
        .exec();
      const salonMap = new Map<string, string>();
      salons.forEach((s) => salonMap.set(s._id.toString(), s.salon_name));

      // Generate signed URLs for images
      const enrichedServices = await Promise.all(
        services.map(async (s) => {
          let image1 = s.image1;
          let image2 = s.image2;
          let image3 = s.image3;

          // Generate signed URLs for images if they exist
          if (image1) {
            image1 = await this.s3Service.get_image_url(image1);
          }
          if (image2) {
            image2 = await this.s3Service.get_image_url(image2);
          }
          if (image3) {
            image3 = await this.s3Service.get_image_url(image3);
          }

          return {
            ...s,
            categoryName: categoryMap.get(s.categoryId.toString()) || null,
            salonName: salonMap.get(s.salonId.toString()) || null,
            image1,
            image2,
            image3,
          };
        }),
      );

      return enrichedServices;
    };

    // If no nameTerm, fetch and enrich
    if (!nameTerm) {
      const services = await this.salonServiceModel
        .find(baseFilter)
        .lean()
        .exec();
      return enrichWithCategoryAndSignedUrls(services);
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

    // Return combined, deduped, and enriched results with signed URLs
    return enrichWithCategoryAndSignedUrls(Array.from(resultsMap.values()));
  }
}
function getSortOptions(sortBy?: string, order: 'asc' | 'desc' = 'desc') {
  const direction = order === 'desc' ? -1 : 1;

  if (sortBy === 'price') {
    return {
      adminSetPrice: direction,
      _id: direction,
    };
  } else if (sortBy) {
    return {
      [sortBy]: direction,
      _id: direction,
    };
  } else {
    return {
      createdAt: direction,
      _id: direction,
    };
  }
}
