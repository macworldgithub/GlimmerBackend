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
import { CreateSalonDto } from 'src/salon/dto/salon.dto';
import {
  CustomerGoogleSignInDto,
  CustomerSignInDto,
  StoreSignInDto,
} from './dtos/request_dtos/signin_dto.dto';
import { CreateCustomerDto } from 'src/customer/dtos/req_dtos/create_customer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SingleImageSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';
import { ApiConsumes } from '@nestjs/swagger';
import { CreateAdminDto } from 'src/admin/dtos/request_dtos/create_admin.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private auth_service: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('salon_image'))
  @ApiConsumes('multipart/form-data')
  @Post('signup/salon')
  async sign_up_salon(
    @Body() createSalonDto: CreateSalonDto,
    @UploadedFile(new SingleImageSizeValidationPipe())
    salon_image: Express.Multer.File,
  ) {
    createSalonDto.salon_image = salon_image;
    return this.auth_service.salon_signup(createSalonDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('signin/salon')
  sign_in_salon(@Body() signin_dto: StoreSignInDto) {
    return this.auth_service.salon_signin(signin_dto);
  }

  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('store_image'))
  @ApiConsumes('multipart/form-data')
  @Post('signup/store')
  sign_up(
    @Body() create_store_dto: CreateStoreDto,
    @UploadedFile(new SingleImageSizeValidationPipe())
    store_image: Express.Multer.File,
  ) {
    create_store_dto.store_image = store_image;
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

  @HttpCode(HttpStatus.OK)
  @Post('login/customer/google')
  signup_with_google(@Body() body: CustomerGoogleSignInDto) {
    return this.auth_service.customer_signup_with_google(body.id_token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup/admin')
  sign_up_admin(@Body() create_admin_dto: CreateAdminDto) {
    return this.auth_service.admin_signup(create_admin_dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin/admin')
  sign_in_admin(@Body() signin_dto: StoreSignInDto) {
    return this.auth_service.admin_signin(signin_dto);
  }
}
