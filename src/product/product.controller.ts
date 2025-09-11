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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { Roles as Roless } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ProductService } from './product.service';
import { AuthPayloadRequest } from './interfaces/auth_payload_request.interface';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  CreateProductDto,
  UpdateProductDto,
} from './dtos/request_dtos/product.dto';
import { FileSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';
import { ProductFiles } from './types/update_product.type';
import { Types } from 'mongoose';
import { SubmitRatingDto } from './dtos/request_dtos/rating.dto';
import { MultiRolesGuard } from 'src/auth/multi-roles.guard';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';

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

    return this.product_service.create_product(product_dto, req.body, req.user);
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

  // @HttpCode(HttpStatus.OK)
  // // @ApiBearerAuth()
  // // @UseGuards(AuthGuard, RolesGuard)
  // // @Role(Roles.STORE)
  // @Get('get_all_store_products')
  // async get_all_store_products(
  //   // @Req() req: AuthPayloadRequest,
  //   @Query('page_no') page_no: number,
  //   @Query('category') category?: string,
  //   @Query('sub_category') sub_category?: string,
  //   @Query('item') item?: string,
  //   @Query('store') store?: string,
  //   @Query('name') name?: string,
  // ) {
  //   return this.product_service.get_all_store_products(
  //     // req.user,
  //     page_no,
  //     category,
  //     sub_category,
  //     item,
  //     store,
  //     name,
  //   );
  // }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, MultiRolesGuard)
  @Roless([Roles.STORE, Roles.SUPERADMIN])
  @Get('get_all_store_products')
  async get_all_store_products(
    @Req() req: AuthPayloadRequest,
    @Query('page_no') page_no: number,
    @Query('category') category?: string,
    @Query('sub_category') sub_category?: string,
    @Query('item') item?: string,
    @Query('name') name?: string,
  ) {
    return this.product_service.get_all_store_products(
      req.user, // Pass the authenticated user's payload
      page_no,
      category,
      sub_category,
      item,
      name,
    );
  }
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Put('bulk_update_product_prices')
  async bulk_update_product_prices(
    @Req() req: AuthPayloadRequest,
    @Body() body: { discount: number; productIds: string[] },
  ) {
    const productIdsAsObjectIds = body.productIds.map(
      (id) => new Types.ObjectId(id),
    );
    return this.product_service.bulk_update_product_prices(
      body.discount,
      productIdsAsObjectIds,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Delete('delete_store_product_by_id')
  delete_product_by_id(@Query('id') id: string) {
    return this.product_service.delete_store_product_by_id(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, MultiRolesGuard)
  @Roless([Roles.STORE, Roles.SUPERADMIN])
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
    return this.product_service.update_store_product(
      id,
      req.user,
      body,
      files,
      req.body,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('get_all_products')
  async get_all_products(
    @Query('page_no') page_no: number,
    @Query('category') category?: string,
    @Query('sub_category') sub_category?: string,
    @Query('item') item?: string,
    @Query('name') name?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: number,
  ) {
    return this.product_service.get_all_products(
      page_no,
      category,
      sub_category,
      item,
      name,
      minPrice,
      maxPrice,
      sortBy,
      order,
      limit,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('get_product_by_id')
  get_product_by_id(@Query('id') id: string) {
    return this.product_service.get_product_by_id(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('submit_rating')
  submit_product_rating(
    @Query('id') product_id: string,
    @Body() rating_dto: SubmitRatingDto,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.product_service.submit_product_rating(
      product_id,
      req.user._id,
      rating_dto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('get_rating')
  get_product_rating(@Query('id') product_id: string): Promise<{
    average_rating: number;
    total_ratings: number;
    rating_distribution: {
      five: number;
      four: number;
      three: number;
      two: number;
      one: number;
    };
  }> {
    return this.product_service.get_product_rating(product_id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('user_rating')
  get_user_rating(
    @Query('id') product_id: string,
    @Req() req: AuthPayloadRequest,
  ): Promise<number | null> {
    return this.product_service.get_user_rating(product_id, req.user._id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('ratings')
  get_product_ratings(@Query('id') product_id: string): Promise<
    Array<{
      _id: string;
      rating: number;
      customer: { name: string; email: string };
      createdAt: Date;
    }>
  > {
    return this.product_service.get_product_ratings(product_id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SUPERADMIN)
  @Put('update_rating')
  update_product_rating(
    @Query('rating_id') rating_id: string,
    @Body() body: { rating: number },
  ) {
    return this.product_service.update_product_rating(rating_id, body.rating);
  }

  // Add this endpoint at the end of the ProductController class
  @HttpCode(HttpStatus.OK)
  @Get('get_all_products_for_admin')
  async get_all_products_for_admin(
    @Query('page_no') page_no: number,
    @Query('category') category?: string,
    @Query('sub_category') sub_category?: string,
    @Query('item') item?: string,
    @Query('store') store?: string,
    @Query('name') name?: string,
  ) {
    return this.product_service.get_all_products_for_admin(
      page_no,
      category,
      sub_category,
      item,
      store,
      name,
    );
  }
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Get('get_store_product_count')
  async get_store_product_count(@Req() req: AuthPayloadRequest) {
    return this.product_service.get_store_product_count(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SUPERADMIN)
  @Get('get_all_rated_products')
  async get_all_rated_products(
    @Query('page_no') page_no: number,
    @Query('page_size') page_size: number = 8,
  ) {
    return this.product_service.get_all_rated_products(page_no, page_size);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Get('get_store_rated_products')
  async get_store_rated_products(
    @Req() req: AuthPayloadRequest,
    @Query('page_no') page_no: number,
    @Query('page_size') page_size: number = 8,
  ) {
    return this.product_service.get_store_rated_products(
      req.user,
      page_no,
      page_size,
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Post('upload-csv')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadProductsCsv(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthPayloadRequest,
  ) {
    if (!file) throw new BadRequestException('CSV file is required');

    const rows: Record<string, string>[] = [];
    const stream = Readable.from(file.buffer.toString());

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    const createdProducts = await this.product_service.bulk_create_products(
      rows,
      req.user, // make sure you pass the store/user ID correctly
    );

    return {
      success: true,
      count: createdProducts.length,
      products: createdProducts,
    };
  }
}
