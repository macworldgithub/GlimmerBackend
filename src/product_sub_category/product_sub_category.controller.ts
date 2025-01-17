import {
  CreateProductSubCategoryDto,
  UpdateProductSubCategoryDto,
} from './dtos/req_dtos/product_sub_category.dto';
import { ProductSubCategoryService } from './product_sub_category.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

@Controller('product-sub-category')
export class ProductSubCategoryController {
  constructor(
    private product_sub_category_service: ProductSubCategoryService,
  ) {}

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Post('create_product_sub_category')
  create_product_sub_category(@Body() body: CreateProductSubCategoryDto) {
    return this.product_sub_category_service.create_product_sub_cateogry(body);
  }

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Put('update_product_sub_category')
  update_product_sub_category(
    @Body() body: UpdateProductSubCategoryDto,
    @Query('id') id: string,
  ) {
    return this.product_sub_category_service.update_product_sub_cateogry(
      body,
      id,
    );
  }

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Get('get_all_sub_categories')
  get_all_sub_categories() {
    return this.product_sub_category_service.get_all_categories();
  }

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Delete('delete_sub_catogory')
  delete_one_subcategory(@Query('id') id: string) {
    return this.product_sub_category_service.delete_sub_category(id);
  }
}
