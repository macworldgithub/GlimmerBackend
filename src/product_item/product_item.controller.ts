import { CreateProducItemDto, UpdateProductItemDto } from './dtos/request_dtos/product_item.dto';
import { ProductItemService } from './product_item.service';
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

@Controller('product_item')
export class ProductItemController {
  constructor(
    private product_item_service: ProductItemService,
  ) {}

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Post('create_product_item')
  create_productitem(@Body() body: CreateProducItemDto) {
    return this.product_item_service.create_product_item(body);
  }

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Put('update_product_item')
  update_product_item(
    @Body() body: UpdateProductItemDto,
    @Query('id') id: string,
  ) {
    return this.product_item_service.update_product_item(
      body,
      id,
    );
  }

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Get('get_all_product_item')
  get_all_sub_categories() {
    return this.product_item_service.get_all_categories();
  }

  @HttpCode(HttpStatus.OK)
  //  @ApiBearerAuth()
  //  @UseGuards(AuthGuard, RolesGuard)
  //  @Role(Roles.STORE)
  @Delete('delete_product_item')
  delete_one_subcategory(@Query('id') id: string) {
    return this.product_item_service.delete_item(id);
  }
}
