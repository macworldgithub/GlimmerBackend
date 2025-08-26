import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/ecommerce/product.schema';
import { ProductRepository } from './product.repository';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/aws/s3.service';
import {
  ProductSubCategory,
  ProductSubCategorySchema,
} from 'src/schemas/ecommerce/product_sub_category.schema';
import { ProductSubCategoryRepository } from 'src/product_sub_category/product_sub_category.repository';
import { Rating, RatingSchema } from 'src/schemas/ecommerce/rating.schema'; 
import { RatingRepository } from 'src/product/rating.repository'; 
import { ProductCategory, ProductCategorySchema } from 'src/schemas/ecommerce/product_category.schema';
import { ProductItem, ProductItemSchema } from 'src/schemas/ecommerce/product_item.schema';
import { ProductCategoryRepository } from 'src/product_category/product_category.repository';
import { ProductItemRepository } from 'src/product_item/product_item.repository';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
      { name: ProductSubCategory.name, schema: ProductSubCategorySchema },
      { name: ProductItem.name, schema: ProductItemSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
  ],
  providers: [
    ProductService,
    ProductRepository,
    ProductCategoryRepository,
    ProductSubCategoryRepository,
    ProductItemRepository,
    JwtService,
    S3Service,
    RatingRepository,
  ],
  controllers: [ProductController],
  exports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ProductService,
    ProductRepository,
    ProductCategoryRepository,
    ProductSubCategoryRepository,
    ProductItemRepository,
    RatingRepository,
  ],
})
export class ProductModule {}