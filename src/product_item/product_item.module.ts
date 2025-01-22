import { Module } from '@nestjs/common';
import { ProductItemController } from './product_item.controller';
import { ProductItemService } from './product_item.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductItem, ProductItemSchema } from 'src/schemas/ecommerce/product_item.schema';
import { ProductItemRepository } from './product_item.repository';
import { ProductCategory, ProductCategorySchema } from 'src/schemas/ecommerce/product_category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductItem.name, schema: ProductItemSchema},
    ]),
    MongooseModule.forFeature([
      { name: ProductCategory.name, schema: ProductCategorySchema},
    ]),
  ],
  controllers: [ProductItemController],
  providers: [ProductItemService, ProductItemRepository]
})
export class ProductItemModule {}
