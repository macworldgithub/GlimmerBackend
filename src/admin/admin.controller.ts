import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Patch,
  Query,
  HttpStatus,
  InternalServerErrorException,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { AdminService, SalonFilter, SalonHighlights } from './admin.service';
import { RecommendedProducts } from 'src/schemas/recommendedProducts/recommendedproducts.schema';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  getSchemaPath,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Delete_recommended_products_dto_response } from './dtos/response/delete.recommended.products.dto';
import { UpdateRateDto } from './dtos/request_dtos/update.rate.dto';
import { RecommendedProductsDto } from './dtos/Recommendedprducts.dto';
import { AddRecommendedProductDto } from './dtos/request_dtos/add.recommended.products.dto';
import { HttpCode } from '@nestjs/common';
import { CreateSaleRecordDto } from './dtos/request_dtos/create.sales.record.dto';
import { Salon } from 'src/schemas/salon/salon.schema';
import { Product } from 'src/schemas/ecommerce/product.schema';
import { GetProductsFilterDto } from './dtos/request_dtos/getProductsFilter.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/get-recommended-products-of-salon/:salonId')
  @ApiOperation({ summary: 'Get recommended products for a given salon' })
  @ApiParam({
    name: 'salonId',
    description: 'Unique identifier for the salon',
    type: String,
    example: '67d918bc4bf2d4af93416da8',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of recommended products',
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Salon not found' })
  async getRecommendedProducts(@Param('salonId') salonId: string) {
    return await this.adminService.getRecommendedProducts(salonId);
  }

  @Get('/recommended-products')
  @ApiOperation({ summary: 'Get all recommended products' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of recommended products records',
    type: [RecommendedProductsDto],
  })
  async getAllRecommendedProducts(@Query('salonId') salonId?: string) {
    return await this.adminService.getAllRecommendedProducts(salonId);
  }

  @Delete('/delete-recommended-products-of-salon/:salonId/:productId')
  @ApiOperation({
    summary: 'Delete a recommended product from a salon recommendation list',
    description:
      'Example: http://localhost:3000/admin/delete-recommended-products-of-salon/67d918bc4bf2d4af93416da8/67975d70c5661506b69dc45a',
  })
  @ApiParam({
    name: 'salonId',
    description: 'Unique identifier for the salon',
    type: String,
    example: '67d918bc4bf2d4af93416da8',
  })
  @ApiParam({
    name: 'productId',
    description: 'Unique identifier of the product to be removed',
    type: String,
    example: '67975d70c5661506b69dc45a',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns the updated recommended products record after deletion',
    type: Delete_recommended_products_dto_response,
  })
  @ApiResponse({ status: 404, description: 'Salon not found' })
  async deleteRecommendedProduct(
    @Param('salonId') salonId: string,
    @Param('productId') productId: string,
  ): Promise<RecommendedProducts> {
    return await this.adminService.deleteRecommendedProduct(salonId, productId);
  }

  @Patch('/update-rate-of-salon/:salonId/:productId')
  @ApiOperation({
    summary: 'Update the rate for a specific product in a salon',
    description: [
      'Example URL:',
      '  PATCH http://localhost:3000/admin/update-rate-of-salon/67d918bc4bf2d4af93416da8/67975d70c5661506b69dc45a',
      '',
      'Request Body:',
      '  { "newRate": 56 }',
    ].join('\n'),
  })
  @ApiParam({
    name: 'salonId',
    description: 'Unique identifier for the salon',
    type: String,
    example: '67d918bc4bf2d4af93416da8',
  })
  @ApiParam({
    name: 'productId',
    description: 'Unique identifier for the product',
    type: String,
    example: '67975d70c5661506b69dc45a',
  })
  @ApiBody({
    type: UpdateRateDto,
    description: 'Payload containing the new rate',
    examples: {
      example1: {
        summary: 'Set rate to 56',
        value: { newRate: 56 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated RecommendedProducts record',
    type: RecommendedProductsDto,
  })
  @ApiResponse({ status: 404, description: 'Salon not found' })
  @ApiResponse({ status: 404, description: 'Product not found in this salon' })
  async updateRate(
    @Param('salonId') salonId: string,
    @Param('productId') productId: string,
    @Body('newRate') newRate: number,
  ): Promise<RecommendedProducts> {
    return this.adminService.updateRate(salonId, productId, newRate);
  }

  @Post('/add-recommended-products/:salonId')
  @ApiOperation({
    summary: 'Add a recommended product to the salon',
    description:
      'Example URL: http://localhost:3000/admin/add-recommended-products/67d918bc4bf2d4af93416da8\n\n' +
      'Request Body: { "productId": "67975d70c5661506b69dc45a" }',
  })
  @ApiParam({
    name: 'salonId',
    description: 'Unique identifier of the salon',
    type: String,
    example: '67d918bc4bf2d4af93416da8',
  })
  @ApiBody({
    type: AddRecommendedProductDto,
    examples: {
      example1: {
        summary: 'Add product by productId',
        value: {
          productId: '67975d70c5661506b69dc45a',
          productName: 'Sample Product Name',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns the updated recommended products record after adding the product',
    type: RecommendedProductsDto,
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict. The product already exists in the recommended list for the salon',
  })
  async addRecommendedProduct(
    @Param('salonId') salonId: string,
    @Body() productItem: any,
  ): Promise<any> {
    return await this.adminService.addRecommendedProduct(salonId, productItem);
  }

  @Post('/create-sale-record-for-salon-cut/:salonId/:productId')
  @ApiOperation({
    summary:
      'Create a sale record for a recommended product and update salon cut',
  })
  @ApiParam({
    name: 'salonId',
    description: 'The ID of the salon',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'The ID of the product',
    type: String,
  })
  @ApiCreatedResponse({
    description: 'Sale record successfully created',
    type: RecommendedProducts,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payload or validation failed',
  })
  @ApiNotFoundResponse({
    description: 'Salon or product not found',
  })
  @HttpCode(HttpStatus.CREATED)
  async createSaleRecord(
    @Param('salonId') salonId: string,
    @Param('productId') productId: string,
    @Body() createSaleDto: any,
  ): Promise<RecommendedProducts> {
    try {
      return await this.adminService.createSaleRecord(
        salonId,
        productId,
        createSaleDto,
      );
    } catch (error) {
      //@ts-ignore
      throw new InternalServerErrorException(
        'Error creating sale record',
        //@ts-ignore
        error.message,
      );
    }
  }

  @Patch(':id/new-to-glimmer')
  @ApiOperation({ summary: 'Mark a salon as New to Glimmer (or unset it)' })
  @ApiParam({
    name: 'id',
    description: 'The salon’s MongoDB ObjectId',
    type: 'string',
    example: '67d918bc4bf2d4af93416da8',
  })
  @ApiBody({
    description: 'Payload to set or unset the NewToGlimmer flag',

    schema: {
      properties: {
        status: { type: 'boolean', example: true },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'The updated salon', type: Salon })
  async setNewToGlimmer(
    @Param('id') id: string,
    @Body('status') status: boolean,
  ): Promise<Salon> {
    return this.adminService.setNewToGlimmer(id, status);
  }

  @Patch(':id/trending-salon')
  @ApiOperation({ summary: 'Mark a salon as Trending (or unset it)' })
  @ApiParam({
    name: 'id',
    description: 'The salon’s MongoDB ObjectId',
    type: 'string',
    example: '67d918bc4bf2d4af93416da8',
  })
  @ApiBody({
    description: 'Payload to set or unset the Trending flag',

    schema: {
      properties: {
        status: { type: 'boolean', example: false },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'The updated salon', type: Salon })
  async setTrendingSalon(
    @Param('id') id: string,
    @Body('status') status: boolean,
  ): Promise<Salon> {
    return this.adminService.setTrendingSalon(id, status);
  }

  @Patch(':id/recommended-salon')
  @ApiOperation({ summary: 'Toggle Recommended flag' })
  @ApiParam({
    name: 'id',
    description: 'The salon’s MongoDB ObjectId',
    example: '67d918bc4bf2d4af93416da8',
  })
  @ApiBody({
    description: 'Enable/disable the Recommended flag',
    schema: {
      required: ['status'],
      properties: { status: { type: 'boolean', example: true } },
    },
  })
  @ApiResponse({ status: 200, description: 'The updated salon', type: Salon })
  setRecommendedSalon(
    @Param('id') id: string,
    @Body('status') status: boolean,
  ): Promise<Salon> {
    return this.adminService.setRecommendedSalon(id, status);
  }

  @Get('salon-highlights')
  @ApiOperation({
    summary: 'Fetch salons by highlight filter, or all three groups if none',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['new-to-glimmer', 'trending-salon', 'recommended-salon'],
    description:
      '“new-to-glimmer” | “trending-salon” | “recommended-salon”; omit for all',
  })
  @ApiResponse({
    status: 200,
    description: 'Either a flat array or an object of arrays',
  })
  getSalonHighlights(
    @Query('filter') filter?: SalonFilter,
  ): Promise<Salon[] | SalonHighlights> {
    return this.adminService.findByFilter(filter);
  }

  @Patch(':productId/trending-product')
  @ApiOperation({ summary: 'Set trending status for a product' })
  async setTrendingProduct(
    @Param('productId') productId: string,
    @Body('status') isTrending: boolean,
  ): Promise<Product> {
    return this.adminService.setTrendingProducts(productId, isTrending);
  }

  @Patch(':productId/best-seller-product')
  @ApiOperation({ summary: 'Set best-seller status for a product' })
  async setBestSeller(
    @Param('productId') productId: string,
    @Body('status') isBestSeller: boolean,
  ): Promise<Product> {
    return this.adminService.setBestSeller(productId, isBestSeller);
  }

  @Patch(':productId/you-must-have-product')
  @ApiOperation({ summary: 'Set "you must have" status for a product' })
  async setYouMustHave(
    @Param('productId') productId: string,
    @Body('status') isYouMustHave: boolean,
  ): Promise<Product> {
    return this.adminService.setYouMustHave(productId, isYouMustHave);
  }

  @Get('/product-highlights')
  @ApiOperation({
    summary: 'Get product highlights grouped by category flags',
    description: 'Returns arrays for best_seller, trending_product and you_must_have_this',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description:
      'Comma-separated list of flags to include (e.g. `filter=best_seller,trending_product`). ' +
      'If omitted, all three categories are returned.',
    style: 'simple',
    explode: false,
    type: String,
    isArray: true,
  })
  @ApiOkResponse({
    description: 'Product highlights fetched successfully',
    schema: {
      type: 'object',
      properties: {
        best_seller: {
          type: 'array',
          items: { $ref: getSchemaPath(Product) },
        },
        trending_product: {
          type: 'array',
          items: { $ref: getSchemaPath(Product) },
        },
        you_must_have_this: {
          type: 'array',
          items: { $ref: getSchemaPath(Product) },
        },
      },
    },
  })
  async getProducts(@Query() filterDto: GetProductsFilterDto) {
    return this.adminService.getProductsHighlights(filterDto);
  }
}
