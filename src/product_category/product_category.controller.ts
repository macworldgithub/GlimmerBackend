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
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dtos/req_dtos/product_category.dto';
import { ProductCategoryService } from './product_category.service';

@Controller('product-category')
export class ProductCategoryController {
  constructor(private product_category_service: ProductCategoryService) {}

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Post('create_product_category')
  create_product_category(@Body() body: CreateProductCategoryDto) {
    return this.product_category_service.create_product_cateogry(body);
  }

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Put('update_product_category')
  update_product_category(
    @Body() body: UpdateProductCategoryDto,
    @Query('id') id: string,
  ) {
    return this.product_category_service.update_product_cateogry(body, id);
  }

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Get('get_all_categories')
  get_all_categories() {
    return this.product_category_service.get_all_categories();
  }

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Delete('delete_product_category')
  delete_product_category(@Query('id') id: string) {
    return this.product_category_service.delete_product_category(id);
  }
}
