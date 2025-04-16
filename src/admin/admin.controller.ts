import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RecommendedProducts } from 'src/schemas/recommendedProducts/recommendedproducts.schema';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Delete_recommended_products_dto_response } from './dtos/response/delete.recommended.products.dto';
import { UpdateRateDto } from './dtos/request_dtos/update.rate.dto';
import { RecommendedProductsDto } from './dtos/Recommendedprducts.dto';
import { AddRecommendedProductDto } from './dtos/request_dtos/add.recommended.products.dto';

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
  async getAllRecommendedProducts() {
    return await this.adminService.getAllRecommendedProducts();
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

  @Patch('/update-rate-of-salon/:salonId')
  @ApiOperation({
    summary: 'Update the rate for a salon',
    description:
      'Example URL: http://localhost:3000/admin/update-rate-of-salon/67d918bc4bf2d4af93416da8\n\n' +
      'Request Body: { "newRate": 56 }',
  })
  @ApiParam({
    name: 'salonId',
    description: 'Unique identifier for the salon',
    type: String,
    example: '67d918bc4bf2d4af93416da8',
  })
  @ApiBody({
    type: UpdateRateDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: { newRate: 56 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated recommended products record',
    type: RecommendedProductsDto,
  })
  @ApiResponse({ status: 404, description: 'Salon not found' })
  async updateRate(
    @Param('salonId') salonId: string,
    @Body('newRate') newRate: number,
  ): Promise<RecommendedProducts> {
    return this.adminService.updateRate(salonId, newRate);
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

  @Get('/sales-summary/:salonId')
  @ApiOperation({
    summary: 'Get sales summary',
    description:
      'Returns total salon cut and sale records for a given salon. ' +
      'Optional filters: productId (filter by product), month (1-12), and year. ' +
      'If productId is provided without month/year, returns all records for that product. ' +
      'If only month is provided, returns records for that month across all years/products, etc.',
  })
  @ApiParam({
    name: 'salonId',
    type: String,
    description: 'Unique identifier for the salon',
    example: '67d918bc4bf2d4af93416da8',
  })
  @ApiQuery({
    name: 'productId',
    type: String,
    required: false,
    description: 'Optional product identifier to filter records',
    example: '6790dc0061ee32e4f9038adf',
  })
  @ApiQuery({
    name: 'month',
    type: Number,
    required: false,
    description: 'Optional month (1-12) to filter the sale records',
    example: 1,
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    required: false,
    description: 'Optional year (e.g., 2023) to filter the sale records',
    example: 2023,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the total salon cut and the matching sale records',
    schema: {
      example: {
        totalSalonCut: 100,
        records: [
          {
            soldAt: '2023-01-15T10:00:00.000Z',
            quantity: 5,
            price: 100,
            salonCut: 20,
          },
          // ... more records
        ],
      },
    },
  })
  async getSalesSummary(
    @Param('salonId') salonId: string,
    @Query('productId') productId?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<{ totalSalonCut: number; records: any[] }> {
    return this.adminService.getSalesSummary(salonId, productId, month, year);
  }
}
