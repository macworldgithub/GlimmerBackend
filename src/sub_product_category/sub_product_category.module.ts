import { Module } from '@nestjs/common';
import { SubProductCategoryController } from './sub_product_category.controller';

@Module({
  controllers: [SubProductCategoryController],
})
export class SubProductCategoryModule {}
