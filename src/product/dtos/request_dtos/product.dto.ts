// @ts-nocheck

import { OmitType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { ProductStatus } from "src/product/enums/product_status.enum";

export class CreateProductDto {
    // req-dto-decorators
    @IsString()
    name: string;

    // req-dto-decorators
    @IsInt()
    @Min(1)
    @Max(Infinity)
    @Transform(({ value }) => parseInt(value, 10))
    quantity: number;

    // req-dto-decorators
    @IsString()
    @IsOptional()
    description?: string;

    // req-dto-decorators
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    @IsString({ each: true })
    images?: string[];

    // req-dto-decorators
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    @Min(0)
    @Max(Infinity)
    base_price: number;

    // req-dto-decorators
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    @Min(0)
    @Max(Infinity)
    discounted_price: number;

    // req-dto-decorators
    @IsEnum(ProductStatus)
    status: ProductStatus;



    constructor(product: Product) {
        if (!product) return;
        this.name = product.name;
        this.status = product.status;
        this.images = product.images;
        this.quantity = product.quantity;
        this.base_price = product.base_price;
        this.description = product.description;
        this.discounted_price = product.discounted_price;
    }
}

type ImageArray = {
    id: string
    image: Express.Multer.File
}

export class ProductTemp extends OmitType(CreateProductDto, ["images"] as const) {
    images?: ImageArray[]
} 
