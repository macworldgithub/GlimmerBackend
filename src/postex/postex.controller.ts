// src/order/postex.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Query,
  Put,
} from '@nestjs/common';
import { PostexService } from './postex.service';
import { PostexOrderDto } from './dto/req/postex.order.dto';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UpdateDeliveryStatusDto } from './dto/req/update_delivery_status.dto';
import { OperationalCityQueryDto } from './dto/req/operational_cities_dto';
import { ListOrdersQueryDto } from './dto/req/list_order_query_dto';
import { TrackOrderParamDto } from './dto/req/track_order_param_dto';
import { CancelOrderDto } from './dto/req/cancel_order_dto';

@Controller('postex')
export class PostexController {
  constructor(private readonly postexService: PostexService) {}

  @Post('order/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'MongoDB ObjectId of the order',
    schema: { type: 'string', example: '665cba3456abcde123456789' },
  })
  async createOrder(@Param('id') orderId: PostexOrderDto) {
    return await this.postexService.createPostexOrder(orderId);
  }

  @Patch('update-delivery-status')
  @ApiBody({ type: UpdateDeliveryStatusDto })
  async updateDeliveryStatus(@Body() dto: UpdateDeliveryStatusDto) {
    return await this.postexService.updateDeliveryStatus(
      dto.id,
      dto.deliver_to_postex,
    );
  }

  @Get('operational-cities')
  @ApiQuery({
    name: 'operationalCityType',
    required: false,
    enum: ['Pickup', 'Delivery'],
  })
  async getCities(@Query() query: OperationalCityQueryDto) {
    return await this.postexService.getOperationalCities(query);
  }

  @Get('orders')
  @ApiQuery({
    name: 'orderStatusID',
    type: Number,
    required: true,
    description: `Order Status ID:
      0: All,
      1: Unbooked,
      2: Booked,
      3: PostEx WareHouse,
      4: Out For Delivery,
      5: Delivered,
      6: Returned,
      7: Un-Assigned By Me,
      8: Expired,
      9: Delivery Under Review,
      15: Picked By PostEx,
      16: Out For Return,
      17: Attempted,
      18: En-Route to PostEx warehouse`,
  })
  @ApiQuery({
    name: 'fromDate',
    type: String,
    required: true,
    description: 'Start date in yyyy-mm-dd format',
  })
  @ApiQuery({
    name: 'toDate',
    type: String,
    required: true,
    description: 'End date in yyyy-mm-dd format',
  })
  async listOrders(@Query() query: ListOrdersQueryDto) {
    return await this.postexService.listOrders(query);
  }

  @ApiParam({
    name: 'trackingNumber',
    required: true,
    description: 'Tracking number provided by PostEx',
    example: 'CX-12345678901',
  })
  async trackOrder(@Param() params: TrackOrderParamDto) {
    return await this.postexService.trackOrder(params.trackingNumber);
  }

  @Put('cancel-order')
  @ApiBody({ type: CancelOrderDto })
  async cancelOrder(@Body() body: CancelOrderDto) {
    return await this.postexService.cancelOrder(body.trackingNumber);
  }
}
