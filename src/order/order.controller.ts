import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { OrderReqDto } from './dtos/req_dtos/order.dto';
import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';
import { OrderService } from './order.service';
import { UpdateStoreOrder } from 'src/schemas/ecommerce/store_order.schema';
import { OrderDTO } from './dtos/req_dtos/order';

@Controller('order')
export class OrderController {
  constructor(private order_service: OrderService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.CUSTOMER)
  @Post('create')
  create_order(@Body() order_dto: OrderDTO, @Req() req: AuthPayloadRequest) {
    console.log('lele', order_dto);
    return this.order_service.create_order(order_dto, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.CUSTOMER)
  @Post('updatePrdoutStatus')
  update_product_status_of_order_provided(
    orderId: string,
    productId: string,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.order_service.update_product_status_of_order_provided(
      orderId,
      productId,
      req.user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('get_order_by_id')
  get_order_by_id(@Query('id') id: string) {
    return this.order_service.get_order_by_id(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Get('get_all_store_orders')
  get_all_store_orders(
    @Query('page_no') page_no: number,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.order_service.get_all_store_orders(page_no, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Get('getOrdersByStore')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of orders per page (default is 8)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'If "Pending", returns only Pending orders. If empty, returns all except Pending.',
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', ''], // Allow empty value
  }) // ✅ Added proper description and handling for empty status
  //@ts-ignore
  getOrdersByStore(
    // @Query('page_no') page_no: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '8',
    @Query('status') status: string,
    @Req() req: AuthPayloadRequest,
  ) {
    //@ts-ignore
    return this.order_service.getOrdersByStore(status, req.user, page, limit);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Get('get_store_order_by_id')
  get_store_order_by_id(@Query('id') id: string) {
    return this.order_service.get_store_order_by_id(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Put('update_store_order_by_id')
  update_store_order_by_id(
    @Query('id') id: string,
    @Body() update_store_order_dto: UpdateStoreOrder,
  ) {
    return this.order_service.update_store_order_by_id(
      id,
      update_store_order_dto,
    );
  }
}
