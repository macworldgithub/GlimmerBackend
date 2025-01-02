import { Body, ClassSerializerInterceptor, Controller, HttpCode, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateStoreDto } from 'src/store/dtos/store.dto';
import { CustomerSignInDto, StoreSignInDto } from './dtos/request_dtos/signin_dto';
import { CreateCustomerDto } from 'src/customer/dtos/req_dtos/create_customer.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
    constructor(private auth_service: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('signup/store')
    sign_up(@Body() create_store_dto: CreateStoreDto) {
        return this.auth_service.store_signup(create_store_dto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin/store')
    sign_in(@Body() signin_dto: StoreSignInDto) {
        return this.auth_service.store_signin(signin_dto)
    }


    @HttpCode(HttpStatus.OK)
    @Post('signup/customer')
    customer_sign_up(@Body() create_customer_dto: CreateCustomerDto) {
        return this.auth_service.customer_signup(create_customer_dto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin/customer')
    customer_sign_in(@Body() customer_signin_dto: CustomerSignInDto) {
        return this.auth_service.customer_signin(customer_signin_dto)
    }

}
