import { Module } from '@nestjs/common';
import { ProductSubCategoryController } from './product_sub_category.controller';
import { ProductSubCategoryService } from './product_sub_category.service';

@Module({
  controllers: [ProductSubCategoryController],
  providers: [ProductSubCategoryService]
})
export class ProductSubCategoryModule {}
