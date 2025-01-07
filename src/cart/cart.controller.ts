import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/auth/roles.decorator';
import { Roles } from 'src/auth/enums/roles.enum';
import { CartDto, UpdateCartDto } from './dtos/req_dtos/cart.dto';
import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';
import { Types } from 'mongoose';

@Controller('cart')
export class CartController {
  constructor(private cart_service: CartService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.CUSTOMER)
  @Post('create')
  create_cart(@Body() cart_dto: CartDto, @Req() req: AuthPayloadRequest) {
    return this.cart_service.crate_cart(cart_dto, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.CUSTOMER)
  @Get('get_cart')
  get_cart(@Req() req: AuthPayloadRequest) {
    return this.cart_service.get_cart(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.CUSTOMER)
  @Put('update_cart')
  update_cart(
    @Req() req: AuthPayloadRequest,
    @Body() update_cart_dto: UpdateCartDto,
  ) {
    return this.cart_service.update_cart_by_customer_id(
      new Types.ObjectId(req.user._id),
      update_cart_dto,
    );
  }
}
