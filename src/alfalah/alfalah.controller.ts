import {
    Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AlfalahService } from './alfalah.service';
import { CreateOrderDto } from 'src/order/dtos/req_dtos/order';

@Controller('alfalah')
export class AlfalahController {
  constructor(private readonly alfalahService: AlfalahService) {}

  // 1️⃣ Create order + transaction + initiate Alfalah payment
  @Post('initiate-payment')
  async initiatePayment(@Body() orderDto: CreateOrderDto) {
    try {
      return await this.alfalahService.createPaymentAndOrder(orderDto);
    } catch (error: any) {
      throw new HttpException(
        { message: 'Failed to initiate payment', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('callback')
  async paymentCallback(
    @Query('orderId') orderId: string,
    @Res() res: Response,
  ) {
    const result = await this.alfalahService.verifyAndFinalize(orderId);

    if (result.success) {
      const { order, transaction } = result;

      //@ts-ignore
      return res.status(HttpStatus.OK).render('alfalah-success', {
        //@ts-ignore
        orderId: order._id,
        //@ts-ignore
        transactionId: transaction.transactionId,
        //@ts-ignore
        customerName: order.customerName,
        //@ts-ignore
        amount: order.discountedTotal,
        //@ts-ignore
        status: transaction.status,
        //@ts-ignore
        paymentGateway: transaction.paymentGateway,
      });
    } else {
      //@ts-ignore
      return res.status(HttpStatus.OK).render('alfalah-failure');
    }
  }
}
