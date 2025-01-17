import { Module } from '@nestjs/common';
import { ProductSubCategoryController } from './product_sub_category.controller';
import { ProductSubCategoryService } from './product_sub_category.service';
import { ProductSubCategoryRepository } from './product_sub_category.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductSubCategory,
  ProductSubCategorySchema,
} from 'src/schemas/ecommerce/product_sub_category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductSubCategory.name, schema: ProductSubCategorySchema },
    ]),
  ],
  controllers: [ProductSubCategoryController],
  providers: [ProductSubCategoryService, ProductSubCategoryRepository],
})
export class ProductSubCategoryModule {}
