import { Module } from '@nestjs/common';
import { ProductCategoryController } from './product_category.controller';
import { ProductCategoryService } from './product_category.service';
import { ProductCategoryRepository } from './product_category.repository';
import {
  ProductCategory,
  ProductCategorySchema,
} from 'src/schemas/ecommerce/product_category.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSubCategoryRepository } from 'src/product_sub_category/product_sub_category.repository';
import {
  ProductSubCategory,
  ProductSubCategorySchema,
} from 'src/schemas/ecommerce/product_sub_category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductCategory.name, schema: ProductCategorySchema },
    ]),
    MongooseModule.forFeature([
      { name: ProductSubCategory.name, schema: ProductSubCategorySchema },
    ]),
  ],
  controllers: [ProductCategoryController],
  providers: [
    ProductCategoryService,
    ProductCategoryRepository,
    ProductSubCategoryRepository,
  ],
  exports: [
    MongooseModule.forFeature([
      { name: ProductCategory.name, schema: ProductCategorySchema },
    ]),
  ],
})
export class ProductCategoryModule {}
