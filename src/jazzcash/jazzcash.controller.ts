import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { JazzcashService } from './jazzcash.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateOrderDto, ProductDto } from 'src/order/dtos/req_dtos/order';
import { JazzCashCallbackDto } from './dto/req/jazz_cash_callback.dt';

@Controller('jazzcash')
export class JazzcashController {
  constructor(private readonly jazzcashservice: JazzcashService) {}

  @Post('initiate-payment')
  async initiatePayment(@Body() order_dto: CreateOrderDto) {
    // Create order + generate JazzCash fields
    const paymentData =
      await this.jazzcashservice.createOrderAndInitiatePayment(order_dto);
    return paymentData;
  }

  @Post('payment-callback')
  async paymentCallback(@Body() body: any, @Res() res: Response) {
    const result = await this.jazzcashservice.handleCallback(body);
    //@ts-ignore
    res.status(HttpStatus.OK).send(result.message);
  }
}
