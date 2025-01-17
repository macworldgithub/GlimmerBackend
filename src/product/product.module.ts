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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([
      { name: ProductSubCategory.name, schema: ProductSubCategorySchema },
    ]),
  ],
  providers: [
    ProductService,
    ProductRepository,
    JwtService,
    S3Service,
    ProductSubCategoryRepository,
  ],
  controllers: [ProductController],
  exports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
})
export class ProductModule {}
