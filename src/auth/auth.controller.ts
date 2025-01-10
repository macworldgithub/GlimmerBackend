import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateStoreDto } from 'src/store/dtos/store.dto';
import {
    CustomerSignInDto,
    StoreSignInDto,
} from './dtos/request_dtos/signin_dto';
import { CreateCustomerDto } from 'src/customer/dtos/req_dtos/create_customer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';
import { ApiConsumes } from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
    constructor(private auth_service: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('store_image'))
    @ApiConsumes('multipart/form-data')
    @Post('signup/store')
    sign_up(@Body() create_store_dto: CreateStoreDto, @UploadedFile(new FileSizeValidationPipe()) store_image: Express.Multer.File) {
        console.log(store_image)
        return
        return this.auth_service.store_signup(create_store_dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin/store')
    sign_in(@Body() signin_dto: StoreSignInDto) {
        return this.auth_service.store_signin(signin_dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signup/customer')
    customer_sign_up(@Body() create_customer_dto: CreateCustomerDto) {
        return this.auth_service.customer_signup(create_customer_dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin/customer')
    customer_sign_in(@Body() customer_signin_dto: CustomerSignInDto) {
        return this.auth_service.customer_signin(customer_signin_dto);
    }
}
