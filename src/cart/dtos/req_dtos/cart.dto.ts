// @ts-nocheck
import { Type } from "class-transformer";
import { IsArray, IsInt, IsMongoId, Max, Min, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { CartItem } from "src/schemas/ecommerce/cart_item.schema";

export class CartDto {

    @IsArray() // Ensures it's an array
    @ValidateNested({ each: true }) // Validates each item in the array
    @Type(() => CartItem) // Specifies the type for transformation
    cart_items: CartItemDto[]
}

class CartItemDto {
    @IsInt()
    @Min(1)
    @Max(5)
    quantity: number;

    // req-dto-decorators
    @IsMongoId()
    product: Types.ObjectId
}


export class UpdateCartDto extends CartDto {}

