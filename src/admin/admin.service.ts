import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RecommendedProducts,
  RecommendedProductsDocument,
} from 'src/schemas/recommendedProducts/recommendedproducts.schema';
import { Product, ProductDocument } from 'src/schemas/ecommerce/product.schema';
import { CreateSaleRecordDto } from './dtos/request_dtos/create.sales.record.dto';
import { UpdateSaleRecordDto } from './dtos/update/update.sales.record.dto';
import { S3Service } from 'src/aws/s3.service';
import { Salon, SalonDocument } from 'src/schemas/salon/salon.schema';
import { GetProductsFilterDto } from './dtos/request_dtos/getProductsFilter.dto';

export type SalonFilter =
  | 'new-to-glimmer'
  | 'trending-salon'
  | 'recommended-salon';

export interface FilterOptions {
  trending?: boolean;
  bestSeller?: boolean;
  youMustHave?: boolean;
}

export interface SalonHighlights {
  newToGlimmer: Salon[];
  trendingSalon: Salon[];
  recommendedSalon: Salon[];
}

@Injectable()
export class AdminService {
  constructor(
    private s3_service: S3Service,

    @InjectModel(RecommendedProducts.name)
    private readonly recommendedProductsModel: Model<RecommendedProductsDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(Salon.name)
    private readonly salonModel: Model<SalonDocument>,
  ) {}

  async addRecommendedProduct(
    salonId: string,
    productItem: any,
  ): Promise<RecommendedProducts> {
    let recommendedRecord = await this.recommendedProductsModel.findOne({
      salonId,
    });
    if (!recommendedRecord) {
      // Create new document if none exists for this salonId
      recommendedRecord = new this.recommendedProductsModel({
        salonId,
        productList: [],
      });
    }
    // Optional: Check if the product already exists in the list
    const exists = recommendedRecord.productList.find(
      (item) => item.productId === productItem.productId,
    );
    if (exists) {
      throw new ConflictException(
        `Product with id ${productItem.productId} already exists in the recommended list for salon ${salonId}`,
      );
    }
    if (!productItem.ref) {
      productItem.ref = salonId;
    }
    recommendedRecord.productList.push(productItem);
    return recommendedRecord.save();
  } //Checked

  async deleteRecommendedProduct(
    salonId: string,
    productId: string,
  ): Promise<RecommendedProducts> {
    const recommendedRecord = await this.recommendedProductsModel.findOne({
      salonId,
    });
    if (!recommendedRecord) {
      throw new NotFoundException(`Salon with id ${salonId} not found`);
    }
    // Filter out the product to be removed
    recommendedRecord.productList = recommendedRecord.productList.filter(
      (item) => item.productId !== productId,
    );
    return recommendedRecord.save();
  } //Checked

  async updateRate(
    salonId: string,
    productId: string,
    newRate: number,
  ): Promise<RecommendedProducts> {
    // 1. Fetch the existing record
    const record = await this.recommendedProductsModel.findOne({ salonId });
    if (!record) {
      throw new NotFoundException(`Salon with id "${salonId}" not found`);
    }

    // 2. Locate the product in the list
    const prod = record.productList.find(
      (item) => item.productId.toString() === productId,
    );
    if (!prod) {
      throw new NotFoundException(
        `Product with id "${productId}" not found for salon "${salonId}"`,
      );
    }

    // 3. Update the rate
    prod.rate = newRate;

    // 4. Persist
    return record.save();
  }

  async updateSoldUnits(
    salonId: string,
    productId: string,
    soldUnitsDelta: number,
  ): Promise<RecommendedProducts> {
    const recommendedRecord = await this.recommendedProductsModel.findOne({
      salonId,
    });
    if (!recommendedRecord) {
      throw new NotFoundException(`Salon with id ${salonId} not found`);
    }
    const productItem = recommendedRecord.productList.find(
      (item) => item.productId === productId,
    );
    if (!productItem) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    // Update the soldUnits by adding the provided delta
    productItem.soldUnits = (productItem.soldUnits || 0) + soldUnitsDelta;
    return recommendedRecord.save();
  }

  async updateReturnedUnits(
    salonId: string,
    productId: string,
    returnedUnitsDelta: number,
  ): Promise<RecommendedProducts> {
    const recommendedRecord = await this.recommendedProductsModel.findOne({
      salonId,
    });
    if (!recommendedRecord) {
      throw new NotFoundException(`Salon with id ${salonId} not found`);
    }
    const productItem = recommendedRecord.productList.find(
      (item) => item.productId === productId,
    );
    if (!productItem) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    // Update the returnedUnits by adding the provided delta
    productItem.returnedUnits =
      (productItem.returnedUnits || 0) + returnedUnitsDelta;
    return recommendedRecord.save();
  }

  /**
   * Retrieve the recommended products for a specific salonId.
   */
  async getRecommendedProducts(salonId: string): Promise<any[]> {
    const recommendedRecord = await this.recommendedProductsModel.findOne({
      salonId,
    });
    if (!recommendedRecord) {
      throw new NotFoundException(`Salon with id ${salonId} not found`);
    }

    const result = [];

    for (const product of recommendedRecord.productList) {
      const productFromDatabase = await this.productModel.findById(
        product.productId,
      );
      if (productFromDatabase) {
        // Update the product with values from the recommendedRecord
        if (productFromDatabase.image1) {
          productFromDatabase.image1 = await this.s3_service.get_image_url(
            productFromDatabase.image1,
          );
        }
        if (productFromDatabase.image2) {
          productFromDatabase.image2 = await this.s3_service.get_image_url(
            productFromDatabase.image2,
          );
        }
        if (productFromDatabase.image3) {
          productFromDatabase.image3 = await this.s3_service.get_image_url(
            productFromDatabase.image3,
          );
        }
        const matched = recommendedRecord?.productList?.find(
          (item) => item.productId === productFromDatabase.id,
        );

        productFromDatabase.rate_of_salon = matched?.rate;
        productFromDatabase.ref_of_salon = salonId;
        result.push(productFromDatabase);
      }
    }

    return result;
  } //Checked

  async getAllRecommendedProducts(salonId?: string): Promise<any> {
    const filter = salonId ? { salonId } : {};
    const recommendedRecord = await this.recommendedProductsModel.find(filter);

    if (!recommendedRecord || recommendedRecord.length === 0) {
      throw new NotFoundException(`No recommended products found`);
    }

    return recommendedRecord;
  }

  async createSaleRecord(
    salonId: string,
    productId: string,
    createSaleDto: CreateSaleRecordDto,
  ): Promise<RecommendedProducts> {
    // Find the recommended products document for the salon.
    const recommendedRecord = await this.recommendedProductsModel.findOne({
      salonId,
    });
    if (!recommendedRecord) {
      throw new NotFoundException(
        `No recommended products record found for salon ${salonId}`,
      );
    }

    // Find the product item by productId.
    const productItem = recommendedRecord.productList.find(
      (item) => item.productId === productId,
    );
    if (!productItem) {
      throw new NotFoundException(
        `Product with id ${productId} not found in recommended list for salon ${salonId}`,
      );
    }

    console.log(createSaleDto, 'eeee');

    // Create the new sale record. The soldAt field will use default Date.now if not provided.
    const saleRecord = {
      quantity: createSaleDto.quantity,
      price: createSaleDto.price,
      salonCut: createSaleDto.salonCut,
      soldAt: new Date(),
    };

    productItem.saleRecords.push(saleRecord);

    console.log(createSaleDto, 'Sale record added');

    // Update soldUnits
    productItem.soldUnits += createSaleDto.quantity;

    await recommendedRecord.save();
    return recommendedRecord;
  }

  async deleteSaleRecord(
    salonId: string,
    productId: string,
    saleRecordTimestamp: string, // unique identifier for the sale record
  ): Promise<RecommendedProducts> {
    const recommendedRecord = await this.recommendedProductsModel.findOne({
      salonId,
    });
    if (!recommendedRecord) {
      throw new NotFoundException(
        `No recommended products record found for salon ${salonId}`,
      );
    }

    const productItem = recommendedRecord.productList.find(
      (item) => item.productId === productId,
    );
    if (!productItem) {
      throw new NotFoundException(
        `Product with id ${productId} not found in recommended list for salon ${salonId}`,
      );
    }

    // Get the index of the sale record by matching soldAt timestamp.
    const index = productItem.saleRecords.findIndex(
      (record) =>
        new Date(record.soldAt).toISOString() ===
        new Date(saleRecordTimestamp).toISOString(),
    );
    if (index === -1) {
      throw new NotFoundException(
        `Sale record with soldAt ${saleRecordTimestamp} not found for product ${productId}`,
      );
    }

    // Adjust soldUnits: subtract the quantity of the removed sale record.
    productItem.soldUnits -= productItem.saleRecords[index].quantity;

    // Remove the sale record from the array.
    productItem.saleRecords.splice(index, 1);

    await recommendedRecord.save();
    return recommendedRecord;
  }

  async updateSaleRecord(
    salonId: string,
    productId: string,
    saleRecordTimestamp: string, // expected to be a date string in ISO format
    updateSaleDto: UpdateSaleRecordDto,
  ): Promise<RecommendedProducts> {
    const recommendedRecord = await this.recommendedProductsModel.findOne({
      salonId,
    });
    if (!recommendedRecord) {
      throw new NotFoundException(
        `No recommended products record found for salon ${salonId}`,
      );
    }

    const productItem = recommendedRecord.productList.find(
      (item) => item.productId === productId,
    );
    if (!productItem) {
      throw new NotFoundException(
        `Product with id ${productId} not found in recommended list for salon ${salonId}`,
      );
    }

    // Find the sale record by comparing the soldAt timestamp (converted to ISO string).
    const saleRecord = productItem.saleRecords.find(
      (record) =>
        new Date(record.soldAt).toISOString() ===
        new Date(saleRecordTimestamp).toISOString(),
    );

    if (!saleRecord) {
      throw new NotFoundException(
        `Sale record with soldAt ${saleRecordTimestamp} not found for product ${productId}`,
      );
    }

    // If quantity is updated, adjust the soldUnits field.
    if (updateSaleDto.quantity !== undefined) {
      // Adjust soldUnits: subtract the old quantity and add the new quantity.
      productItem.soldUnits =
        productItem.soldUnits - saleRecord.quantity + updateSaleDto.quantity;
      saleRecord.quantity = updateSaleDto.quantity;
    }
    if (updateSaleDto.price !== undefined) {
      saleRecord.price = updateSaleDto.price;
    }
    if (updateSaleDto.salonCut !== undefined) {
      saleRecord.salonCut = updateSaleDto.salonCut;
    }

    await recommendedRecord.save();
    return recommendedRecord;
  }

  async setNewToGlimmer(salonId: string, isNew: boolean): Promise<Salon> {
    const updated = await this.salonModel
      .findByIdAndUpdate(
        salonId,
        { $set: { newToGlimmer: isNew } },
        { new: true }, // return the updated document
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Salon with id "${salonId}" not found.`);
    }
    return updated;
  }

  async setTrendingSalon(salonId: string, isTrending: boolean): Promise<Salon> {
    const updated = await this.salonModel
      .findByIdAndUpdate(
        salonId,
        { $set: { trendingSalon: isTrending } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Salon with id "${salonId}" not found.`);
    }
    return updated;
  }

  async setRecommendedSalon(
    salonId: string,
    isRecommended: boolean,
  ): Promise<Salon> {
    const updated = await this.salonModel
      .findByIdAndUpdate(
        salonId,
        { $set: { recommendedSalon: isRecommended } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Salon with id "${salonId}" not found.`);
    }
    return updated;
  }

  private async attachImageUrls(salons: any[]): Promise<any[]> {
    return Promise.all(
      salons.map(async (s) => {
        const { image1, image2, image3, image4, salon_image, ...rest } = s;
        return {
          ...rest,
          image1: image1 ? await this.s3_service.get_image_url(image1) : null,
          image2: image2 ? await this.s3_service.get_image_url(image2) : null,
          image3: image3 ? await this.s3_service.get_image_url(image3) : null,
          image4: image4 ? await this.s3_service.get_image_url(image4) : null,
          salon_image: salon_image
            ? await this.s3_service.get_image_url(salon_image)
            : null,
        };
      }),
    );
  }

  async findByFilter(filter?: SalonFilter): Promise<any[] | SalonHighlights> {
    const wantAll = !filter;

    // fetch + post-process one category
    const fetchAndTransform = async (
      condition: Record<string, any>,
    ): Promise<any[]> => {
      const docs = await this.salonModel.find(condition).lean().exec();
      return this.attachImageUrls(docs);
    };

    if (wantAll) {
      const [newToGlimmer, trendingSalon, recommendedSalon] = await Promise.all(
        [
          fetchAndTransform({ newToGlimmer: true }),
          fetchAndTransform({ trendingSalon: true }),
          fetchAndTransform({ recommendedSalon: true }),
        ],
      );
      return { newToGlimmer, trendingSalon, recommendedSalon };
    }

    // single‐filter mode
    switch (filter) {
      case 'new-to-glimmer':
        return fetchAndTransform({ newToGlimmer: true });
      case 'trending-salon':
        return fetchAndTransform({ trendingSalon: true });
      case 'recommended-salon':
        return fetchAndTransform({ recommendedSalon: true });
      default:
        throw new BadRequestException(
          `Unsupported filter "${filter}". Use ` +
            `"new-to-glimmer", "trending-salon" or "recommended-salon".`,
        );
    }
  }

  async getProductsHighlights(
    filterDto: GetProductsFilterDto,
  ): Promise<Record<string, any[]>> {
    const { filter } = filterDto;
    const wantAll = !filter || filter.length === 0;
    const result: Record<string, any[]> = {};

    // helper to fetch + transform one category
    const fetchAndTransform = async (
      key: string,
      condition: Record<string, any>,
    ) => {
      if (wantAll || filter.includes(key)) {
        // 1. grab plain objects
        const products = await this.productModel.find(condition).lean().exec();

        // 2. map each to include full URLs
        result[key] = await Promise.all(
          products.map(async (p) => {
            return {
              ...p,
              image1: p.image1
                ? await this.s3_service.get_image_url(p.image1)
                : null,
              image2: p.image2
                ? await this.s3_service.get_image_url(p.image2)
                : null,
              image3: p.image3
                ? await this.s3_service.get_image_url(p.image3)
                : null,
            };
          }),
        );
      }
    };

    await fetchAndTransform('best_seller', { best_seller: true });
    await fetchAndTransform('trending_product', { trending_product: true });
    await fetchAndTransform('you_must_have_this', { you_must_have_this: true });

    return result;
  }

  async setTrendingProducts(
    productId: string,
    isTrending: boolean,
  ): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(
        productId,
        { $set: { trending_product: isTrending } },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException(`Product with id "${productId}" not found.`);
    }
    return updated;
  }

  async setBestSeller(
    productId: string,
    isBestSeller: boolean,
  ): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(
        productId,
        { $set: { best_seller: isBestSeller } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Product with id "${productId}" not found.`);
    }
    return updated;
  }

  async setYouMustHave(
    productId: string,
    isYouMustHave: boolean,
  ): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(
        productId,
        { $set: { you_must_have_this: isYouMustHave } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Product with id "${productId}" not found.`);
    }
    return updated;
  }
}
