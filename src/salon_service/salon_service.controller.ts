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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
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

@ApiTags('Salon Services')
@Controller('salon-services')
export class SalonServicesController {
  constructor(private readonly salonServicesService: SalonServicesService) {}

  @Post('createService')
  @ApiOperation({ summary: 'Create a new salon service' })
  create(@Body() createSalonServiceDto: CreateSalonServiceDto) {
    return this.salonServicesService.create(createSalonServiceDto);
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
  @Get('getAllServicesForSalon')
  @ApiOperation({ summary: 'Get all salon services(for salon dahboard)' })
  @ApiQuery({ name: 'page_no', type: String, required: true })
  @ApiQuery({ name: 'salonId', type: String, required: true })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'subCategoryName', type: String, required: false })
  @ApiQuery({ name: 'subSubCategoryName', type: String, required: false })
  getAllServicesForSalon(@Query() query: any) {
    return this.salonServicesService.findAllServices(query);
  }
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
  @Get('changeActivationStatus')
  @ApiOperation({ summary: 'Change Status of the service' })
  @ApiQuery({ name: 'id', type: String, required: true })
  changeStatus(@Query('id') id: string) {
    return this.salonServicesService.changeActivationStatus(id);
  }

  @Put('updateServiceById')
  @ApiOperation({ summary: 'Update an existing salon service' })
  update(@Body() updateSalonServiceDto: UpdateSalonServiceDto) {
    return this.salonServicesService.update(updateSalonServiceDto);
  }

  @Patch('requestPriceUpdate')
  @ApiOperation({ summary: 'Request a price update (Employee action)' })
  requestPriceUpdate(@Body() requestPriceUpdateDto: RequestPriceUpdateDto) {
    return this.salonServicesService.requestPriceUpdate(requestPriceUpdateDto);
  }

  @Patch('approvePriceUpdate')
  @ApiOperation({ summary: 'Approve or reject a price update (Admin only)' })
  approvePriceUpdate(@Body() approvePriceUpdateDto: ApprovePriceUpdateDto) {
    return this.salonServicesService.approvePriceUpdate(approvePriceUpdateDto);
  }

  @Patch('applyDiscounttoSingleService')
  @ApiOperation({ summary: 'Apply a  discount to single services' })
  applyDiscount(@Body() applyDiscountDto: ApplyDiscountDto) {
    return this.salonServicesService.applyDiscount(applyDiscountDto);
  }
  @Patch('applyBulkDiscount')
  @ApiOperation({ summary: 'Apply a global discount to all services' })
  applyBulkDiscount(@Body() applyDiscountDto: ApplyBulkDiscountDto) {
    return this.salonServicesService.applyBulkDiscount(applyDiscountDto);
  }

  @Patch('removeDiscountFromSingleService')
  @ApiOperation({ summary: 'Remove discount from all services' })
  removeDiscount(@Body() removeDiscountDto: RemoveDiscountDto) {
    return this.salonServicesService.removeDiscount(removeDiscountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a salon service' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.salonServicesService.remove(id);
  }
}
