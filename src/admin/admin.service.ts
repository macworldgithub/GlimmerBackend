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

@Injectable()
export class AdminService {
  constructor(
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

  async updateRate(salonId: string, newRate: number): Promise<RecommendedProducts> {
    let recommendedRecord = await this.recommendedProductsModel.findOne({ salonId });
    
    if (!recommendedRecord) {
      // Create a new document if one doesn't exist for the given salonId.
      recommendedRecord = new this.recommendedProductsModel({ salonId, productList: [], rate: newRate });
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
}
