import { Module } from '@nestjs/common';
import { ProductItemController } from './product_item.controller';
import { ProductItemService } from './product_item.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductItem, ProductItemSchema } from 'src/schemas/ecommerce/product_item.schema';
import { ProductItemRepository } from './product_item.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductItem.name, schema: ProductItemSchema},
    ]),
  ],
  controllers: [ProductItemController],
  providers: [ProductItemService, ProductItemRepository]
})
export class ProductItemModule {}
