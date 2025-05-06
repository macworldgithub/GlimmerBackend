import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SalonServiceBookingService } from './salon_service_booking.service';
import { CreateSalonServiceBookingDto, UpdateSalonServiceBookingStatusDto } from './dto/create_salon_service_booking.dto';
import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';


@ApiTags('Salon Service Bookings')
@Controller('salon-service-bookings')
export class SalonServiceBookingController {
  constructor(private readonly bookingService: SalonServiceBookingService) {}
  
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a new salon service booking' })
  @ApiResponse({ status: 201, description: 'Booking successfully created'})
  @Post("create")
  async createBooking(@Body() bookingData: CreateSalonServiceBookingDto) {
    return this.bookingService.createBooking(bookingData);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  // @Role(Roles.SUPERADMIN)
  @ApiOperation({ summary: 'Get all salon service bookings' })
  @ApiResponse({ status: 200, description: 'Returns all bookings' })
  @Get("getAllBookingForAdmin")
  @ApiOperation({ summary: 'Get all salon services (for admin )' })
    @ApiQuery({ name: 'page_no', type: String, required: true })
    @ApiQuery({ name: 'categoryId', type: String, required: false })
    @ApiQuery({ name: 'salonId', type: String, required: false })
    @ApiQuery({ name: 'status', type: String, required: false })
    @ApiQuery({ name: 'subCategoryName', type: String, required: false })
    @ApiQuery({ name: 'subSubCategoryName', type: String, required: false })
    @ApiQuery({ name: 'customerName', type: String, required: false })
    @ApiQuery({ name: 'serviceName', type: String, required: false })
  async getAllBookings(@Query() query: any){
    return this.bookingService.getAllBookings(query);
  }
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @ApiOperation({ summary: 'Get all salon service bookings' })
  @ApiResponse({ status: 200, description: 'Returns all bookings' })
  @Get("getAllSalonBooking")
  @ApiOperation({ summary: 'Get all salon services (for admin )' })
    @ApiQuery({ name: 'page_no', type: String, required: true })
    @ApiQuery({ name: 'categoryId', type: String, required: false })
    @ApiQuery({ name: 'status', type: String, required: false })
    @ApiQuery({ name: 'subCategoryName', type: String, required: false })
    @ApiQuery({ name: 'subSubCategoryName', type: String, required: false })
    @ApiQuery({ name: 'customerName', type: String, required: false })
    @ApiQuery({ name: 'serviceName', type: String, required: false })
  async getAllSalonBookings(@Query() query: any, @Req() req: AuthPayloadRequest){
    console.log(req,"opopop",req.user)
    return this.bookingService.getAllSalonBookings(query,req.user);
  }
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @ApiOperation({ summary: 'Get all salon service bookings status' })
  @ApiResponse({ status: 200, description: 'Returns all bookings status' })
  @Get("getAllSalonBookingStatus")
  @ApiOperation({ summary: 'Get all salon services status (for admin )' })
    @ApiQuery({ name: 'page_no', type: String, required: false })
    @ApiQuery({ name: 'categoryId', type: String, required: false })
    @ApiQuery({ name: 'status', type: String, required: false })
    @ApiQuery({ name: 'subCategoryName', type: String, required: false })
    @ApiQuery({ name: 'subSubCategoryName', type: String, required: false })
  async getAllSalonBookingStatus(@Query() query: any, @Req() req: AuthPayloadRequest){
    console.log(req,"opopop",req.user)
    return this.bookingService.getAllSalonBookingStatus(query,req.user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @ApiOperation({ summary: 'Get a single salon service booking by ID' })
  @ApiResponse({ status: 200, description: 'Returns booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @Get('getbookingDetailsById')
  @ApiQuery({ name: 'bookingId', type: String, required: true,description: 'ID of the booking'  })
  async getBookingById(@Query('bookingId') bookingId: string) {
    return this.bookingService.getBookingById(bookingId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @ApiOperation({ summary: 'Approve Booking' })
  @ApiResponse({ status: 200, description: 'Returns booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @Put('approveBooking')
  @ApiQuery({ name: 'bookingId', type: String, required: true,description: 'ID of the booking'  })
  async approveBooking(@Query('bookingId') bookingId: string) {
    return this.bookingService.approveBooking(bookingId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @ApiOperation({ summary: 'Reject Booking' })
  @ApiResponse({ status: 200, description: 'Returns booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @Put('rejectBooking')
  @ApiQuery({ name: 'bookingId', type: String, required: true,description: 'ID of the booking'  })
  async rejectBooking(@Query('bookingId') bookingId: string) {
    return this.bookingService.rejectBooking(bookingId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @ApiOperation({ summary: 'Update a salon service booking Status After Approving' })
  @ApiResponse({ status: 200, description: 'Booking Status successfully updated' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @Put('updateApprovedBookingStatus')
  async updateApprovedBookingStatus(
    @Body() updateData:UpdateSalonServiceBookingStatusDto,
  ) {
    return this.bookingService.updateApprovedBookingStatus(updateData);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SUPERADMIN)
  @ApiOperation({ summary: 'Delete a salon service booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully deleted' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'bookingId', required: true, description: 'ID of the booking to delete' })
  @Delete(':bookingId')
  async deleteBooking(@Param('bookingId') bookingId: string) {
    return this.bookingService.deleteBooking(bookingId);
  }
}
