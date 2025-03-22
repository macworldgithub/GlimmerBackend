import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Delete,
  Query,
  Put,
  HttpCode,
  UseGuards,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { SalonServicesService } from './salon_service.service';
import {
  CreateSalonServiceDto,
  UpdateSalonServiceDto,
  RequestPriceUpdateDto,
  ApplyDiscountDto,
  ApprovePriceUpdateDto,
  RemoveDiscountDto,
  ApplyBulkDiscountDto,
} from './dto/create_salon_service.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/auth/roles.decorator';
import { Roles } from 'src/auth/enums/roles.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';
import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';

@ApiTags('Salon Services')
@Controller('salon-services')
export class SalonServicesController {
  constructor(private readonly salonServicesService: SalonServicesService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @Post('createService')
  @UseInterceptors(
      FileFieldsInterceptor([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
      ]),
    )
     @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new salon service' })
  create(@Body() createSalonServiceDto: CreateSalonServiceDto,
  @UploadedFiles(new FileSizeValidationPipe())
      files: {
        image1?: Express.Multer.File[];
        image2?: Express.Multer.File[];
        image3?: Express.Multer.File[];
      },
    @Req() req: AuthPayloadRequest,
    ) {
        createSalonServiceDto.image1 = files.image1?.length ? files.image1[0] : undefined;
        createSalonServiceDto.image2 = files.image2?.length ? files.image2[0] : undefined;
        createSalonServiceDto.image3 = files.image3?.length ? files.image3[0] : undefined;

    return this.salonServicesService.create(createSalonServiceDto,req.user);
  }

  @Get('getAllActiveServicesForWebiste')
  @ApiOperation({ summary: 'Get all salon services' })
  @ApiQuery({ name: 'page_no', type: String, required: true })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'salonId', type: String, required: false })
  @ApiQuery({ name: 'subCategoryName', type: String, required: false })
  @ApiQuery({ name: 'subSubCategoryName', type: String, required: false })
  findAllActive(@Query() query: any) {
    return this.salonServicesService.findAllActive(query);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @Get('getAllServicesForSalon')
  @ApiOperation({ summary: 'Get all salon services(for salon dahboard)' })
  @ApiQuery({ name: 'page_no', type: String, required: true })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'subCategoryName', type: String, required: false })
  @ApiQuery({ name: 'subSubCategoryName', type: String, required: false })
  getAllServicesForSalon(@Query() query: any,@Req() req: AuthPayloadRequest,) {
    return this.salonServicesService.findAllServices(query,req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SUPERADMIN)
  @Get('getAllServicesForAdmin')
  @ApiOperation({ summary: 'Get all salon services (for admin )' })
  @ApiQuery({ name: 'page_no', type: String, required: true })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'salonId', type: String, required: false })
  @ApiQuery({ name: 'status', type: String, required: false })
  @ApiQuery({ name: 'subCategoryName', type: String, required: false })
  @ApiQuery({ name: 'subSubCategoryName', type: String, required: false })
  getAllServicesForAdmin(@Query() query: any) {
    return this.salonServicesService.findAllServices(query);
  }

  @Get('getServiceById')
  @ApiOperation({ summary: 'Get a single salon service by ID' })
  @ApiQuery({ name: 'id', type: String, required: true })
  findOne(@Query('id') id: string) {
    return this.salonServicesService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @Get('changeActivationStatus')
  @ApiOperation({ summary: 'Change Status of the service' })
  @ApiQuery({ name: 'id', type: String, required: true })
  changeStatus(@Query('id') id: string) {
    return this.salonServicesService.changeActivationStatus(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  // @Role(Roles.SALON)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image1', maxCount: 1 },
      { name: 'image2', maxCount: 1 },
      { name: 'image3', maxCount: 1 },
    ]),
  )
   @ApiConsumes('multipart/form-data')
  @Put('updateServiceById')
  @ApiOperation({ summary: 'Update an existing salon service' })
  update(@Body() updateSalonServiceDto: UpdateSalonServiceDto,@UploadedFiles(new FileSizeValidationPipe())
  files: {
    image1?: Express.Multer.File[];
    image2?: Express.Multer.File[];
    image3?: Express.Multer.File[];
  },
@Req() req: AuthPayloadRequest,
) {
  
    return this.salonServicesService.update(updateSalonServiceDto,files,req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @Patch('requestPriceUpdate')
  @ApiOperation({ summary: 'Request a price update (Employee action)' })
  requestPriceUpdate(@Body() requestPriceUpdateDto: RequestPriceUpdateDto) {
    return this.salonServicesService.requestPriceUpdate(requestPriceUpdateDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SUPERADMIN)
  @Patch('approvePriceUpdate')
  @ApiOperation({ summary: 'Approve or reject a price update (Admin only)' })
  approvePriceUpdate(@Body() approvePriceUpdateDto: ApprovePriceUpdateDto) {
    return this.salonServicesService.approvePriceUpdate(approvePriceUpdateDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @Patch('applyDiscounttoSingleService')
  @ApiOperation({ summary: 'Apply a  discount to single services' })
  applyDiscount(@Body() applyDiscountDto: ApplyDiscountDto) {
    return this.salonServicesService.applyDiscount(applyDiscountDto);
  }
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @Patch('applyBulkDiscount')
  @ApiOperation({ summary: 'Apply a global discount to all services' })
  applyBulkDiscount(@Body() applyDiscountDto: ApplyBulkDiscountDto) {
    return this.salonServicesService.applyBulkDiscount(applyDiscountDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @Patch('removeDiscountFromSingleService')
  @ApiOperation({ summary: 'Remove discount from all services' })
  removeDiscount(@Body() removeDiscountDto: RemoveDiscountDto) {
    return this.salonServicesService.removeDiscount(removeDiscountDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SUPERADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a salon service' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.salonServicesService.remove(id);
  }
}
