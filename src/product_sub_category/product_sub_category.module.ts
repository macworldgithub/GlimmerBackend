import { Module } from '@nestjs/common';
import { ProductSubCategoryController } from './product_sub_category.controller';
import { ProductSubCategoryService } from './product_sub_category.service';
import { ProductSubCategoryRepository } from './product_sub_category.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductSubCategory,
  ProductSubCategorySchema,
} from 'src/schemas/ecommerce/product_sub_category.schema';
import { ProductItemRepository } from 'src/product_item/product_item.repository';
import { ProductItem, ProductItemSchema } from 'src/schemas/ecommerce/product_item.schema';
import { ProductCategory, ProductCategorySchema } from 'src/schemas/ecommerce/product_category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductSubCategory.name, schema: ProductSubCategorySchema },
    ]),
    MongooseModule.forFeature([
      { name: ProductItem.name, schema: ProductItemSchema },
    ]),
    MongooseModule.forFeature([
      { name: ProductCategory.name, schema: ProductCategorySchema},
    ]),
  ],
  controllers: [ProductSubCategoryController],
  providers: [ProductSubCategoryService, ProductSubCategoryRepository, ProductItemRepository],
})
export class ProductSubCategoryModule {}
