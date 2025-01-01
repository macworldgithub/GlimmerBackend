import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Product, UpdateProductDto } from 'src/schemas/ecommerce/product.schema';
import { ProductService } from './product.service';
import { AuthPayloadRequest } from './interfaces/auth_payload_request.interface';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags("Ecommerce Products")
@Controller('product')
export class ProductController {
    constructor(private product_service: ProductService) { }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Post('create')
    create_product(@Body() product_dto: Product, @Req() req: AuthPayloadRequest) {
        return this.product_service.create_product(product_dto, req.user)
    }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Get('get_store_product_by_id')
    get_product_by_id(@Query("id") id: string, @Req() req: AuthPayloadRequest) {
        return this.product_service.get_store_product_by_id(id, req.user)
    }


    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Get('get_all_store_products')
    async get_all_store_products(@Req() req: AuthPayloadRequest, @Query("page_no") page_no : number) {
        return this.product_service.get_all_store_products(req.user, page_no)
    }


    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Delete('delete_store_product_by_id')
    delete_product_by_id(@Query("id") id: string, @Req() req: AuthPayloadRequest) {
        return this.product_service.delete_store_product_by_id(id, req.user)
    }


    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Put('update_store_product_by_id')
    update_product_by_id(@Query("id") id: string, @Req() req: AuthPayloadRequest, @Body() body: UpdateProductDto) {
        return this.product_service.update_store_product(id, req.user, body)
    }


}
