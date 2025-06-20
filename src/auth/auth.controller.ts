import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException
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
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe, SingleImageSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';
import { ApiConsumes } from '@nestjs/swagger';
import { CreateAdminDto } from 'src/admin/dtos/request_dtos/create_admin.dto';
import { PostexService } from 'src/postex/postex.service';
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private auth_service: AuthService) {}
  @HttpCode(HttpStatus.OK)
   @UseInterceptors(
      FileFieldsInterceptor([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
      ]),
    )
  @ApiConsumes('multipart/form-data')
  @Post('signup/salon')
  async sign_up_salon(
    @Body() createSalonDto: CreateSalonDto,
    @UploadedFiles(new FileSizeValidationPipe())
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
      image4?: Express.Multer.File[];
    },
  ) {
    createSalonDto.image1 = files.image1?.length ? files.image1[0] : undefined;
    createSalonDto.image2 = files.image2?.length ? files.image2[0] : undefined;
    createSalonDto.image3 = files.image3?.length ? files.image3[0] : undefined;
    createSalonDto.image4 = files.image4?.length ? files.image4[0] : undefined;
    return this.auth_service.salon_signup(createSalonDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('signin/salon')
  sign_in_salon(@Body() signin_dto: StoreSignInDto) {
    return this.auth_service.salon_signin(signin_dto);
  }

  // @HttpCode(HttpStatus.OK)
  // @UseInterceptors(FileInterceptor('store_image'))
  // @ApiConsumes('multipart/form-data')
  // @Post('signup/store')
  // sign_up(
  //   @Body() create_store_dto: CreateStoreDto,
  //   @UploadedFile(new SingleImageSizeValidationPipe())
  //   store_image: Express.Multer.File,
  // ) {
  //   create_store_dto.store_image = store_image;
  //   return this.auth_service.store_signup(create_store_dto);
  // }
@HttpCode(HttpStatus.OK)
@UseInterceptors(FileInterceptor('store_image'))
@ApiConsumes('multipart/form-data')
@Post('signup/store')
async sign_up(
  @Body() create_store_dto: CreateStoreDto,
  @UploadedFile(new SingleImageSizeValidationPipe()) store_image: Express.Multer.File,
) {
  if (!store_image) {
    throw new BadRequestException('Store image is required');
  }
  if (!create_store_dto.cityName) {
    throw new BadRequestException('City Name is required');
  }
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

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; currentPassword: string; newPassword: string }) {
    return this.auth_service.resetPassword(body.email, body.currentPassword, body.newPassword);
  }
}
