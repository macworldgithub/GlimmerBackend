import { Module } from '@nestjs/common';
import { ProductCategoryController } from './product_category.controller';
import { ProductCategoryService } from './product_category.service';

@Module({
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService]
})
export class ProductCategoryModule {}
