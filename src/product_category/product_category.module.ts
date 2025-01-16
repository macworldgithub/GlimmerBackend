import { Module } from '@nestjs/common';
import { ProductCategoryController } from './product_category.controller';
import { ProductCategoryService } from './product_category.service';
import { ProductCategoryRepository } from './product_category.repository';
import { ProductCategory, ProductCategorySchema } from 'src/schemas/ecommerce/product_category.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProductCategory.name, schema: ProductCategorySchema}]),
  ],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService, ProductCategoryRepository],
  exports: [
    MongooseModule.forFeature([{ name: ProductCategory.name, schema: ProductCategorySchema}]),
  ],
})
export class ProductCategoryModule {}
