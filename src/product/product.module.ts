import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/ecommerce/product.schema';
import { ProductRepository } from './product.repository';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
        ]),
    ],
    providers: [ProductService, ProductRepository, JwtService],
    controllers: [ProductController],
    exports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
        ]),
    ],
})
export class ProductModule { }
