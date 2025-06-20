// import {
//   Controller,
//   Post,
//   Body,
//   Param,
//   Patch,
//   Get,
//   Query,
//   Put,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { PostexService } from './postex.service';
// import { PostexOrderDto } from './dto/req/postex.order.dto';
// import { ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
// import { UpdateDeliveryStatusDto } from './dto/req/update_delivery_status.dto';
// import { OperationalCityQueryDto } from './dto/req/operational_cities_dto';
// import { ListOrdersQueryDto } from './dto/req/list_order_query_dto';
// import { TrackOrderParamDto } from './dto/req/track_order_param_dto';
// import { CancelOrderDto } from './dto/req/cancel_order_dto';
// import { PaymentStatusParamDto } from './dto/req/payment-status-param.dto';

// @Controller('postex')
// export class PostexController {
//   constructor(private readonly postexService: PostexService) {}

//   @Post('order')
//   @ApiBody({ type: PostexOrderDto })
//   @ApiResponse({
//     status: 200,
//     description: 'Order successfully registered with PostEx',
//     content: {
//       'application/json': {
//         example: {
//           statusCode: '200',
//           statusMessage: 'ORDER HAS BEEN CREATED',
//           dist: {
//             trackingNumber: 'CX-12345678901',
//             orderStatus: 'UnBooked',
//             orderDate: '2025-06-13 12:00:00',
//           },
//         },
//       },
//     },
//   })
//   @ApiResponse({ status: 404, description: 'Order not found' })
//   async createOrder(@Body() orderIdDto: PostexOrderDto) {
//     if (!orderIdDto.orderId || typeof orderIdDto.orderId !== 'string') {
//       throw new HttpException(
//         { message: ['orderId must be a string'], error: 'Bad Request', statusCode: 400 },
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//     return await this.postexService.createPostexOrder(orderIdDto);
//   }

//   @Patch('update-delivery-status')
//   @ApiBody({ type: UpdateDeliveryStatusDto })
//   @ApiResponse({
//     status: 200,
//     description: 'Delivery status updated',
//     content: {
//       'application/json': {
//         example: {
//           message: 'Delivery status updated',
//           data: {
//             _id: '664ab3456abcde123456789',
//             trackingNumber: 'CX-12345678901',
//             orderStatus: 'pending',
//             deliver_to_postex: true,
//           },
//         },
//       },
//     },
//   })
//   @ApiResponse({ status: 404, description: 'Registered order not found' })
//   async updateDeliveryStatus(@Body() dto: UpdateDeliveryStatusDto) {
//     return await this.postexService.updateDeliveryStatus(
//       dto.id,
//       dto.deliver_to_postex,
//     );
//   }

//   @Get('operational-cities')
//   @ApiQuery({
//     name: 'operationalCityType',
//     required: false,
//     enum: ['Pickup', 'Delivery'],
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'List of operational cities returned successfully',
//     content: {
//       'application/json': {
//         example: {
//           statusCode: '200',
//           statusMessage: 'SUCCESSFULLY OPERATED',
//           dist: [
//             {
//               operationalCityName: 'Lahore',
//               countryName: 'Pakistan',
//               isPickupCity: true,
//               isDeliveryCity: true,
//             },
//           ],
//         },
//       },
//     },
//   })
//   async getCities(@Query() query: OperationalCityQueryDto) {
//     return await this.postexService.getOperationalCities(query);
//   }

//   @Get('orders')
//   @ApiQuery({
//     name: 'orderStatusID',
//     type: Number,
//     required: true,
//     description: `Order Status ID:
//       0: All,
//       1: Unbooked,
//       2: Booked,
//       3: PostEx WareHouse,
//       4: Out For Delivery,
//       5: Delivered,
//       6: Returned,
//       7: Un-Assigned By Me,
//       8: Expired,
//       9: Delivery Under Review,
//       15: Picked By PostEx,
//       16: Out For Return,
//       17: Attempted,
//       18: En-Route to PostEx warehouse`,
//   })
//   @ApiQuery({
//     name: 'fromDate',
//     type: String,
//     required: true,
//     description: 'Start date in yyyy-mm-dd format',
//   })
//   @ApiQuery({
//     name: 'toDate',
//     type: String,
//     required: true,
//     description: 'End date in yyyy-mm-dd format',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Orders fetched successfully within date range',
//     content: {
//       'application/json': {
//         example: {
//           statusCode: '200',
//           statusMessage: 'SUCCESSFULLY OPERATED',
//           dist: [
//             {
//               trackingNumber: 'CX-12345678901',
//               customerName: 'John Doe',
//               orderRefNumber: '665cb...',
//               invoicePayment: 500,
//               transactionStatus: 'Booked',
//             },
//           ],
//         },
//       },
//     },
//   })
//   async listOrders(@Query() query: ListOrdersQueryDto) {
//     return await this.postexService.listOrders(query);
//   }

//   @ApiParam({
//     name: 'trackingNumber',
//     required: true,
//     description: 'Tracking number provided by PostEx',
//     example: 'CX-12345678901',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Order tracking details retrieved successfully',
//     content: {
//       'application/json': {
//         example: {
//           statusCode: '200',
//           statusMessage: 'SUCCESSFULLY OPERATED',
//           dist: {
//             trackingNumber: 'CX-12345678901',
//             customerName: 'John Doe',
//             orderRefNumber: '665cb...',
//             transactionStatus: 'Out For Delivery',
//             transactionStatusHistory: [
//               {
//                 transactionStatusMessage: "At Merchant's Warehouse",
//                 transactionStatusMessageCode: '0001',
//                 statusMeaning: 'At Merchant’s Warehouse',
//               },
//             ],
//           },
//         },
//       },
//     },
//   })
//   async trackOrder(@Param() params: TrackOrderParamDto) {
//     return await this.postexService.trackOrder(params.trackingNumber);
//   }

//   @Put('cancel-order')
//   @ApiBody({ type: CancelOrderDto })
//   @ApiResponse({
//     status: 200,
//     description: 'Order successfully cancelled in PostEx and locally',
//     content: {
//       'application/json': {
//         example: {
//           message: 'Order successfully cancelled in PostEx and local DB',
//           trackingNumber: 'CX-12345678901',
//         },
//       },
//     },
//   })
//   async cancelOrder(@Body() body: CancelOrderDto) {
//     return await this.postexService.cancelOrder(body.trackingNumber);
//   }

//   @Get('payment-status/:trackingNumber')
//   @ApiParam({
//     name: 'trackingNumber',
//     required: true,
//     description: 'Tracking number provided by PostEx',
//     example: 'CX-12345678901',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Payment status retrieved successfully',
//     content: {
//       'application/json': {
//         example: {
//           statusCode: '200',
//           statusMessage: 'SUCCESSFULLY OPERATED',
//           dist: {
//             orderRefNumber: '665cb...',
//             trackingNumber: 'CX-12345678901',
//             settle: true,
//             settlementDate: '2025-06-12',
//             upfrontPaymentDate: '2025-06-10',
//             cprNumber_1: 'ABC123',
//             reservePaymentDate: '2025-06-11',
//             cprNumber_2: 'XYZ456',
//           },
//         },
//       },
//     },
//   })
//   @ApiResponse({
//     status: 404,
//     description: 'Tracking number not found or not settled yet',
//   })
//   async getPaymentStatus(@Param() params: PaymentStatusParamDto) {
//     return await this.postexService.getPaymentStatus(params.trackingNumber);
//   }
// }
import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Query,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PostexService } from './postex.service';
import { PostexOrderDto } from './dto/req/postex.order.dto';
import { ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UpdateDeliveryStatusDto } from './dto/req/update_delivery_status.dto';
import { OperationalCityQueryDto } from './dto/req/operational_cities_dto';
import { ListOrdersQueryDto } from './dto/req/list_order_query_dto';
import { TrackOrderParamDto } from './dto/req/track_order_param_dto';
import { CancelOrderDto } from './dto/req/cancel_order_dto';
import { PaymentStatusParamDto } from './dto/req/payment-status-param.dto';

@Controller('postex')
export class PostexController {
  constructor(private readonly postexService: PostexService) {}

  @Post('order')
  @ApiBody({ type: PostexOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Order successfully registered with PostEx',
    content: {
      'application/json': {
        example: {
          statusCode: '200',
          statusMessage: 'ORDER HAS BEEN CREATED',
          dist: {
            trackingNumber: 'CX-12345678901',
            orderStatus: 'UnBooked',
            orderDate: '2025-06-13 12:00:00',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createOrder(@Body() orderIdDto: PostexOrderDto) {
    if (!orderIdDto.orderId || typeof orderIdDto.orderId !== 'string') {
      throw new HttpException(
        { message: ['orderId must be a string'], error: 'Bad Request', statusCode: 400 },
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.postexService.createPostexOrder(orderIdDto);
  }

  @Patch('update-delivery-status')
  @ApiBody({ type: UpdateDeliveryStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Delivery status updated',
    content: {
      'application/json': {
        example: {
          message: 'Delivery status updated',
          data: {
            _id: '664ab3456abcde123456789',
            trackingNumber: 'CX-12345678901',
            orderStatus: 'pending',
            deliver_to_postex: true,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Registered order not found' })
  async updateDeliveryStatus(@Body() dto: UpdateDeliveryStatusDto) {
    return await this.postexService.updateDeliveryStatus(dto.id, dto.deliver_to_postex);
  }

  // @Get('operational-cities')
  // @ApiQuery({
  //   name: 'operationalCityType',
  //   required: false,
  //   enum: ['Pickup', 'Delivery'],
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of operational cities returned successfully',
  //   content: {
  //     'application/json': {
  //       example: {
  //         statusCode: '200',
  //         statusMessage: 'SUCCESSFULLY OPERATED',
  //         dist: [
  //           {
  //             operationalCityName: 'Lahore',
  //             countryName: 'Pakistan',
  //             isPickupCity: true,
  //             isDeliveryCity: true,
  //           },
  //         ],
  //       },
  //     },
  //   },
  // })
  // async getCities(@Query() query: OperationalCityQueryDto) {
  //   return await this.postexService.getOperationalCities(query);
  // }
  @Get('operational-cities')
@ApiQuery({
  name: 'operationalCityType',
  required: false, // Indicates the parameter is optional, allowing null or omission
  enum: ['pickup', 'delivery'], // Changed to lowercase
  description: 'A variable to filter cities for pickup or delivery',
})
@ApiResponse({
  status: 200,
  description: 'List of operational cities returned successfully',
  content: {
    'application/json': {
      example: {
        statusCode: '200',
        statusMessage: 'SUCCESSFULLY OPERATED',
        dist: [
          {
            operationalCityName: 'Lahore',
            countryName: 'Pakistan',
            isPickupCity: true,
            isDeliveryCity: true,
          },
        ],
      },
    },
  },
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
  @ApiResponse({
    status: 200,
    description: 'Orders fetched successfully within date range',
    content: {
      'application/json': {
        example: {
          statusCode: '200',
          statusMessage: 'SUCCESSFULLY OPERATED',
          dist: [
            {
              trackingNumber: 'CX-12345678901',
              customerName: 'John Doe',
              orderRefNumber: '665cb...',
              invoicePayment: 500,
              transactionStatus: 'Booked',
            },
          ],
        },
      },
    },
  })
  async listOrders(@Query() query: ListOrdersQueryDto) {
    return await this.postexService.listOrders(query);
  }

  @Get('track-order/:trackingNumber')
  @ApiParam({
    name: 'trackingNumber',
    required: true,
    description: 'Tracking number provided by PostEx',
    example: 'CX-12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Order tracking details retrieved successfully',
    content: {
      'application/json': {
        example: {
          statusCode: '200',
          statusMessage: 'SUCCESSFULLY OPERATED',
          dist: {
            trackingNumber: 'CX-12345678901',
            customerName: 'John Doe',
            orderRefNumber: '665cb...',
            transactionStatus: 'Out For Delivery',
            transactionStatusHistory: [
              {
                transactionStatusMessage: "At Merchant's Warehouse",
                transactionStatusMessageCode: '0001',
                statusMeaning: 'At Merchant’s Warehouse',
              },
            ],
          },
        },
      },
    },
  })
  async trackOrder(@Param() params: TrackOrderParamDto) {
    return await this.postexService.trackOrder(params.trackingNumber);
  }

  @Put('cancel-order')
  @ApiBody({ type: CancelOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Order successfully cancelled in PostEx and locally',
    content: {
      'application/json': {
        example: {
          message: 'Order successfully cancelled in PostEx and local DB',
          trackingNumber: 'CX-12345678901',
        },
      },
    },
  })
  async cancelOrder(@Body() body: CancelOrderDto) {
    return await this.postexService.cancelOrder(body.trackingNumber);
  }

  @Get('payment-status/:trackingNumber')
  @ApiParam({
    name: 'trackingNumber',
    required: true,
    description: 'Tracking number provided by PostEx',
    example: 'CX-12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
    content: {
      'application/json': {
        example: {
          statusCode: '200',
          statusMessage: 'SUCCESSFULLY OPERATED',
          dist: {
            orderRefNumber: '665cb...',
            trackingNumber: 'CX-12345678901',
            settle: true,
            settlementDate: '2025-06-12',
            upfrontPaymentDate: '2025-06-10',
            cprNumber_1: 'ABC123',
            reservePaymentDate: '2025-06-11',
            cprNumber_2: 'XYZ456',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tracking number not found or not settled yet',
  })
  async getPaymentStatus(@Param() params: PaymentStatusParamDto) {
    return await this.postexService.getPaymentStatus(params.trackingNumber);
  }
}