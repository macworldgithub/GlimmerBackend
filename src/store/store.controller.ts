import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';
import { StoreService } from './store.service';
import { UpdateStoreDto } from 'src/schemas/ecommerce/store.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { SingleImageSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private store_service: StoreService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Get('get_store')
  get_store_by_id(@Req() req: AuthPayloadRequest) {
    return this.store_service.get_store_by_id(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Delete('delete_store')
  delete_store_by_id(@Req() req: AuthPayloadRequest) {
    return this.store_service.delete_store_by_id(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('store_image'))
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Put('update_store')
  update_store_by_id(
    @Req() req: AuthPayloadRequest,
    @Body() body: UpdateStoreDto,
    @UploadedFile(new SingleImageSizeValidationPipe())
    store_image: Express.Multer.File,
  ) {
    store_image ? (body.store_image = store_image) : null;
    return this.store_service.update_store(req.user, body);
  }

  // For Admin
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.STORE)
  @Get('get_all_stores')
  get_all_stores(@Query('page_no') page_no: number) {
    return this.store_service.get_all_stores(page_no);
  }
}
