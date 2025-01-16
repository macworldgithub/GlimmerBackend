import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateProductCategoryDto } from './dtos/req_dtos/product_category.dto';
import { ProductCategoryService } from './product_category.service';

@Controller('product-category')
export class ProductCategoryController {

    constructor(private product_category_service : ProductCategoryService) {}

  @HttpCode(HttpStatus.OK)
//  @ApiBearerAuth()
//  @UseGuards(AuthGuard, RolesGuard)
//  @Role(Roles.STORE)
  @Post('create_product_category')
  create_product_category(@Body() body: CreateProductCategoryDto) {
    return this.product_category_service.create_product_cateogry(body)
  }

}
