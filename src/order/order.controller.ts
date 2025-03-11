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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { OrderReqDto } from './dtos/req_dtos/order.dto';
import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';
import { OrderService } from './order.service';
import { UpdateStoreOrder } from 'src/schemas/ecommerce/store_order.schema';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateProductStatusDto,
} from './dtos/req_dtos/order';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private order_service: OrderService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Post('create')
  create_order(@Body() order_dto: CreateOrderDto) {
    return this.order_service.create_order(order_dto);
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
  @Get('get_all_pending_store_orders')
  get_all_store_orders(
    @Query('store_id') store_id: string,
    @Query('page_no') page_no: number,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.order_service.get_all_store_orders(page_no, store_id, req.user);
  }
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Get('get_all_accepted_rejected_store_orders')
  get_all_accepted_rejected_store_orders(
    @Query('store_id') store_id: string,
    @Query('page_no') page_no: number,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.order_service.get_all_accepted_rejected_store_orders(
      page_no,
      store_id,
      req.user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  // @UseGuards(AuthGuard, RolesGuard)
  // @Role(Roles.SUPERADMIN)
  @Get('get_all_admin_pending_orders')
  get_all_admin_pending_orders(
    @Query('page_no') page_no: string,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.order_service.get_all_admin_pending_orders(page_no, req.user);
  }
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  // @UseGuards(AuthGuard, RolesGuard)
  // @Role(Roles.SUPERADMIN)
  @Get('get_all_admin_accepted_rejected_orders')
  get_all_admin_accepted_rejected_orders(
    @Query('page_no') page_no: string,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.order_service.get_all_admin_accepted_rejected_orders(
      page_no,
      req.user,
    );
  }
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Put('updateProductStatus')
  update_product_status_of_order_provided(
    @Body() Order: UpdateProductStatusDto,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.order_service.update_product_status_of_order_provided(
      Order,
      req.user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  // @UseGuards(AuthGuard, RolesGuard)
  // @Role(Roles.SUPERADMIN)
  @Put('updateOrderStatus')
  update_order_status(
    @Body() Order: UpdateOrderStatusDto,
    @Req() req: AuthPayloadRequest,
  ) {
    return this.order_service.update_order_status(Order, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SUPERADMIN)
  @Delete('deleteOrder')
  delete_order(
    @Query('order_id') order_id: string,

    @Req() req: AuthPayloadRequest,
  ) {
    return this.order_service.delete_order(order_id);
  }

  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard, RolesGuard)
  // @Role(Roles.STORE)
  // @Get('getOrdersByStore')
  // @ApiQuery({
  //   name: 'page',
  //   required: false,
  //   type: Number,
  //   description: 'Page number for pagination',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   type: Number,
  //   description: 'Number of orders per page (default is 8)',
  // })
  // @ApiQuery({
  //   name: 'status',
  //   required: false,
  //   description:
  //     'If "Pending", returns only Pending orders. If empty, returns all except Pending.',
  //   enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', ''], // Allow empty value
  // }) // ✅ Added proper description and handling for empty status
  // //@ts-ignore
  // getOrdersByStore(
  //   // @Query('page_no') page_no: number,
  //   @Query('page') page: string = '1',
  //   @Query('limit') limit: string = '8',
  //   @Query('status') status: string,
  //   @Req() req: AuthPayloadRequest,
  // ) {
  //   //@ts-ignore
  //   return this.order_service.getOrdersByStore(status, req.user, page, limit);
  // }

  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard, RolesGuard)
  // @Role(Roles.STORE)
  // @Get('get_store_order_by_id')
  // get_store_order_by_id(@Query('id') id: string) {
  //   return this.order_service.get_store_order_by_id(id);
  // }

  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard, RolesGuard)
  // @Role(Roles.STORE)
  // @Put('update_store_order_by_id')
  // update_store_order_by_id(
  //   @Query('id') id: string,
  //   @Body() update_store_order_dto: UpdateStoreOrder,
  // ) {
  //   return this.order_service.update_store_order_by_id(
  //     id,
  //     update_store_order_dto,
  //   );
  // }
}
