import {
  Injectable,
  NotFoundException,
  ConflictException,
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

@Injectable()
export class AdminService {
  constructor(
    private s3_service: S3Service,

    @InjectModel(RecommendedProducts.name)
    private readonly recommendedProductsModel: Model<RecommendedProductsDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

   
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
    newRate: number,
  ): Promise<RecommendedProducts> {
    let recommendedRecord = await this.recommendedProductsModel.findOne({
      salonId,
    });

    if (!recommendedRecord) {
      // Create a new document if one doesn't exist for the given salonId.
      recommendedRecord = new this.recommendedProductsModel({
        salonId,
        productList: [],
        rate: newRate,
      });
    } else {
      // Update the existing document's rate.
      recommendedRecord.rate = newRate;
    }

    return recommendedRecord.save();
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
          productFromDatabase.image1 = await this.s3_service.get_image_url(productFromDatabase.image1);
        }
        if (productFromDatabase.image2) {
          productFromDatabase.image2 = await this.s3_service.get_image_url(productFromDatabase.image2);
        }
        if (productFromDatabase.image3) {
          productFromDatabase.image3 = await this.s3_service.get_image_url(productFromDatabase.image3);
        }

        productFromDatabase.rate_of_salon = recommendedRecord.rate;
        productFromDatabase.ref_of_salon = salonId;
        result.push(productFromDatabase);
      }
    }

    return result;
  } //Checked

  async getAllRecommendedProducts(): Promise<any> {
    const recommendedRecord = await this.recommendedProductsModel.find({});
    if (!recommendedRecord) {
      throw new NotFoundException(`not found`);
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

    // Create the new sale record. The soldAt field will use default Date.now if not provided.
    productItem.saleRecords.push({
      quantity: createSaleDto.quantity,
      price: createSaleDto.price,
      salonCut: createSaleDto.salonCut,
      soldAt: new Date(),
    });

    // Optionally update the total soldUnits (for aggregation or reporting purposes)
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

 /**
   * Returns sales summary for a given salon, optionally filtered by productId, month, and year.
   *
   * - If productId is provided, returns sales for that product only (all months/years if month/year not provided).
   * - If no productId is provided, aggregates sale records from all products for that salon.
   * - If month is provided, only records from that month are returned (across years if year not provided).
   * - If year is provided, only records from that year are returned (across months if month not provided).
   *
   * @param salonId - Required salon identifier.
   * @param productId - Optional product identifier to filter the records.
   * @param month - Optional month (1-12) to filter sale records.
   * @param year - Optional full year (e.g., 2023) to filter sale records.
   * @returns An object containing the totalSalonCut and the matching sale records.
   */
 async getSalesSummary(
  salonId: string,
  productId?: string,
  month?: number,
  year?: number,
): Promise<{ totalSalonCut: number; records: any[] }> {
  // Get the recommended products document for the salon.
  const recommendedRecord = await this.recommendedProductsModel.findOne({ salonId });
  if (!recommendedRecord) {
    throw new NotFoundException(`No recommended products record found for salon ${salonId}`);
  }

  // Gather sale records from either a specific product or from all products.
  let allSaleRecords: any[] = [];
  if (productId) {
    const productItem = recommendedRecord.productList.find(
      (item) => item.productId === productId,
    );
    if (!productItem) {
      throw new NotFoundException(
        `Product with id ${productId} not found in recommended list for salon ${salonId}`,
      );
    }
    allSaleRecords = productItem.saleRecords;
  } else {
    // Combine saleRecords from all products
    for (const productItem of recommendedRecord.productList) {
      allSaleRecords = allSaleRecords.concat(productItem.saleRecords);
    }
  }

  // Apply filters for month and year if provided.
  let filteredRecords = allSaleRecords;
  if (month !== undefined) {
    filteredRecords = filteredRecords.filter((record) => {
      const soldAtDate = new Date(record.soldAt);
      return soldAtDate.getMonth() + 1 === month;
    });
  }
  if (year !== undefined) {
    filteredRecords = filteredRecords.filter((record) => {
      const soldAtDate = new Date(record.soldAt);
      return soldAtDate.getFullYear() === year;
    });
  }

  // Sum the salonCut for the filtered records.
  const totalSalonCut = filteredRecords.reduce(
    (acc, curr) => acc + curr.salonCut,
    0,
  );

  return { totalSalonCut, records: filteredRecords };
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
}
