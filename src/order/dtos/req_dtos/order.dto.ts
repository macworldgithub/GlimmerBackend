// @ts-nocheck

import { Type } from "class-transformer";
import { IsArray, IsInt, IsMongoId, Max, Min, ValidateNested } from "class-validator";
import { Types } from "mongoose";

export class OrderReqDto {

    @IsMongoId()
    customer: Types.ObjectId

    @IsArray() // Ensures it's an array
    @ValidateNested({ each: true }) // Validates each item in the array
    @Type(() => OrderItemDto) // Specifies the type for transformation
    order_items: OrderItemDto[]
}

class OrderItemDto {
    @IsInt()
    @Min(1)
    @Max(5)
    quantity: number;

    // req-dto-decorators
    @IsMongoId()
    product: Types.ObjectId
}
