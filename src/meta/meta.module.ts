import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { Product, ProductSchema } from 'src/schemas/ecommerce/product.schema';
import { S3Service } from 'src/aws/s3.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  providers: [MetaService, S3Service],
  exports: [MetaService], // ✅ so you can use it anywhere
  controllers: [MetaController],
})
export class MetaModule {}
