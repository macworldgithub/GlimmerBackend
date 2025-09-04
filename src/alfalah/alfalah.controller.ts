// import {
//   Body,
//   Controller,
//   Get,
//   HttpException,
//   HttpStatus,
//   Logger,
//   Post,
//   Query,
//   Res,
// } from '@nestjs/common';
// import { AlfalahService } from './alfalah.service';
// import { CreateOrderDto } from 'src/order/dtos/req_dtos/order';

// const logger = new Logger('AlfalahController');

// @Controller('alfalah')
// export class AlfalahController {
//   constructor(private readonly alfalahService: AlfalahService) {}

//   @Post('initiate-payment')
//   async initiatePayment(@Body() orderDto: any) {
//     try {
//       const result =
//         await this.alfalahService.createOrderAndInitiateAlfalahPayment(
//           orderDto,
//         );

//       return {
//         success: true,
//         sessionId: result.sessionId,
//       };
//     } catch (error: any) {
//       // Log detailed error for backend debugging
//       console.error('💥 Error initiating Alfalah payment:', {
//         message: error?.message,
//         stack: error?.stack,
//         payload: orderDto,
//       });

//       throw new HttpException(
//         {
//           message: 'Failed to initiate payment',
//           error: error?.message || 'Unknown error',
//         },
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   @Get('callback')
//   async paymentCallback(
//     @Query('orderId') OrderId: string,
//     @Res() res: Response,
//   ) {
//     if (!OrderId) {
//       return (
//         res
//           //@ts-ignore
//           .status(HttpStatus.BAD_REQUEST)
//           .send('Missing orderId in query params.')
//       );
//     }

//     try {
//       const result =
//         await this.alfalahService.verifyAndFinalize(OrderId);

//       if (result.success) {
//         const { order, transaction } = result;

//         logger.log(`✅ Payment successful for Order ${OrderId}`);

//         //@ts-ignore

//         return res.status(HttpStatus.OK).render('alfalah-success', {
//           orderId: order?._id,
//           transactionId: order?._id, // Consider using transaction._id instead
//           customerName: order?.customerName,
//           amount: order?.discountedTotal,
//           status: 'Paid',
//           paymentGateway: 'Bank Alfalah',
//         });
//       } else {
//         logger.warn(
//           `❌ Payment failed for Order ${OrderId}: ${result.reason}`,
//         );
//         //@ts-ignore
//         return res.status(HttpStatus.OK).render('alfalah-failure', {
//           reason: result.reason || 'Payment failed',
//         });
//       }
//     } catch (error: any) {
//       logger.error(
//         `💥 Error verifying payment for Order ${OrderId}`,
//         error.stack || error.message,
//       );

//       return (
//         res
//           //@ts-ignore
//           .status(HttpStatus.INTERNAL_SERVER_ERROR)
//           .render('alfalah-failure', {
//             reason: 'Internal server error while verifying payment',
//           })
//       );
//     }
//   }
// }
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AlfalahService } from './alfalah.service';
import { TransactionDocument } from 'src/schemas/transactions/transaction.schema';
import { OrderDocument } from 'src/schemas/ecommerce/order.schema';

const logger = new Logger('AlfalahController');

@Controller('alfalah')
export class AlfalahController {
  constructor(private readonly alfalahService: AlfalahService) {}

  @Post('initiate-payment')
  async initiatePayment(@Body() orderDto: any, @Res() res: any) {
    try {
      const htmlForm =
        await this.alfalahService.createOrderAndInitiateAlfalahPayment(
          orderDto,
        );
      res.set('Content-Type', 'text/html');
      return res.send(htmlForm);
    } catch (error: any) {
      console.error('💥 Error initiating Alfalah payment:', {
        message: error?.message,
        stack: error?.stack,
        payload: orderDto,
      });

      throw new HttpException(
        {
          message: 'Failed to initiate payment',
          error: error?.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('initiate-booking-payment')
  async initiateBookingPayment(@Body() bookingDto: any, @Res() res: any) {
    try {
      const htmlForm =
        await this.alfalahService.createBookingAndInitiateAlfalahPayment(
          bookingDto,
        );
      res.set('Content-Type', 'text/html');
      return res.send(htmlForm);
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Failed to initiate booking payment',
          error: error?.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('callback')
  async paymentCallback(@Query('orderId') OrderId: string, @Res() res: any) {
    if (!OrderId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Missing orderId in query params.');
    }

    try {
      const result = await this.alfalahService.verifyAndFinalize(OrderId);

      if (result.success) {
        const { order, transaction } = result as {
          order: OrderDocument;
          transaction: TransactionDocument;
        };
        logger.log(`✅ Payment successful for Order ${OrderId}`);

        return res.status(HttpStatus.OK).render('alfalah-success', {
          orderId: order?._id,
          transactionId: transaction?._id,
          customerName: order?.customerName,
          amount: order?.discountedTotal,
          status: 'Paid',
          paymentGateway: 'Bank Alfalah',
        });
      } else {
        logger.warn(`❌ Payment failed for Order ${OrderId}: ${result.reason}`);
        return res.status(HttpStatus.OK).render('alfalah-failure', {
          reason: result.reason || 'Payment failed',
        });
      }
    } catch (error: any) {
      logger.error(
        `💥 Error verifying payment for Order ${OrderId}`,
        error.stack || error.message,
      );
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .render('alfalah-failure', {
          reason: 'Internal server error while verifying payment',
        });
    }
  }
  @Get('booking-callback')
  async bookingPaymentCallback(
    @Query('bookingId') bookingId: string,
    @Res() res: any,
  ) {
    if (!bookingId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Missing bookingId in query params.');
    }

    try {
      const result =
        await this.alfalahService.verifyAndFinalizeBooking(bookingId);

      if (result.success) {
        const { booking, transaction } = result;
        return res.status(HttpStatus.OK).render('alfalah-success', {
          bookingId: booking?._id,
          transactionId: transaction?._id,
          customerName: booking?.customerName,
          amount: booking?.finalPrice,
          status: 'Paid',
          paymentGateway: 'Bank Alfalah',
        });
      } else {
        return res.status(HttpStatus.OK).render('alfalah-failure', {
          reason: result.reason || 'Payment failed',
        });
      }
    } catch (error: any) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .render('alfalah-failure', {
          reason: 'Internal server error while verifying booking payment',
        });
    }
  }
}
