import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ProductService } from './product.service';
import { AuthPayloadRequest } from './interfaces/auth_payload_request.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  CreateProductDto,
  UpdateProductDto,
} from './dtos/request_dtos/product.dto';
import { FileSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';
import { ProductFiles } from './types/update_product.type';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Ecommerce Products')
@Controller('product')
export class ProductController {
  constructor(private product_service: ProductService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image1', maxCount: 1 },
      { name: 'image2', maxCount: 1 },
      { name: 'image3', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @Post('create')
  create_product(
    @Body() product_dto: CreateProductDto,
    @UploadedFiles(new FileSizeValidationPipe())
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
    },
    @Req() req: AuthPayloadRequest,
  ) {
    product_dto.image1 = files.image1?.length ? files.image1[0] : undefined;
    product_dto.image2 = files.image2?.length ? files.image2[0] : undefined;
    product_dto.image3 = files.image3?.length ? files.image3[0] : undefined;

   

    return this.product_service.create_product(product_dto, req.body,  req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Get('get_store_product_by_id')
  get_store_product_by_id(
    @Query('id') id: string,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.product_service.get_store_product_by_id(id, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Get('get_all_store_products')
  async get_all_store_products(
    @Req() req: AuthPayloadRequest,
    @Query('page_no') page_no: number,
    @Query('category') category?: string,
    @Query('sub_category') sub_category?: string,
    @Query('item') item?: string,
  ) {
    return this.product_service.get_all_store_products(
      req.user,
      page_no,
      category,
      sub_category,
      item,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Put('bulk_update_product_prices')
  async bulk_update_product_prices(
    @Req() req: AuthPayloadRequest,
    @Body() body: { discount: number },
  ) {
    return this.product_service.bulk_update_product_prices(
      req.user,
      body.discount,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Delete('delete_store_product_by_id')
  delete_product_by_id(
    @Query('id') id: string,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.product_service.delete_store_product_by_id(id, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image1', maxCount: 1 },
      { name: 'image2', maxCount: 1 },
      { name: 'image3', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @Put('update_store_product_by_id')
  update_product_by_id(
    @Query('id') id: string,
    @Req() req: AuthPayloadRequest,
    @Body() body: UpdateProductDto,
    @UploadedFiles(new FileSizeValidationPipe())
    files: ProductFiles,
  ) {
    return this.product_service.update_store_product(id, req.user, body, files ,req.body);
  }

  @HttpCode(HttpStatus.OK)
  @Get('get_all_products')
  async get_all_products(
    @Query('page_no') page_no: number,
    @Query('category') category?: string,
    @Query('sub_category') sub_category?: string,
    @Query('item') item?: string,
  ) {
    return this.product_service.get_all_products(
      page_no,
      category,
      sub_category,
      item,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('get_product_by_id')
  get_product_by_id(@Query('id') id: string) {
    return this.product_service.get_product_by_id(id);
  }
}
