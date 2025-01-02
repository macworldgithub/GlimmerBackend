import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { OrderReqDto } from './dtos/req_dtos/order.dto';
import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {

    constructor(private order_service : OrderService) {}

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.CUSTOMER)
    @Post('create')
    create_order(@Body() order_dto : OrderReqDto, @Req() req: AuthPayloadRequest) {
        return this.order_service.create_order(order_dto, req.user)
    }

    @HttpCode(HttpStatus.OK)
    @Get('get_order_by_id')
    get_order_by_id(@Query("id") id: string) {
        return this.order_service.get_order_by_id(id)
    }
}

