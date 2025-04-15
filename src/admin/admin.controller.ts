import { Controller, Post, Body, Param, Get ,Delete ,Patch} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RecommendedProducts } from 'src/schemas/recommendedProducts/recommendedproducts.schema';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/get-recommended-products-of-salon/:salonId')
  async getRecommendedProducts(@Param('salonId') salonId: string) {
    return await this.adminService.getRecommendedProducts(salonId);
  }

  @Delete('/delete-recommended-products-of-salon/:salonId/:productId')
  async deleteRecommendedProduct(
    @Param('salonId') salonId: string,
    @Param('productId') productId: string,
  ): Promise<RecommendedProducts> {
    return await this.adminService.deleteRecommendedProduct(salonId, productId);
  }

  @Patch('/update-rate-of-salon/:salonId')
  async updateRate(
    @Param('salonId') salonId: string,
    @Body('newRate') newRate: number,
  ): Promise<RecommendedProducts> {
    return this.adminService.updateRate(salonId, newRate);
  }

  @Post('/add-recommended-products/:salonId')
  async addRecommendedProduct(
    @Param('salonId') salonId: string,
    @Body() productItem: any,
  ): Promise<any> {
    return await this.adminService.addRecommendedProduct(salonId, productItem);
  }
}
