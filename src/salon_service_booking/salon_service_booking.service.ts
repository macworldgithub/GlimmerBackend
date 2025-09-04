import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SalonServiceBookingRepository } from './salon_service_booking.repository';
import {
  CreateSalonServiceBookingDto,
  UpdateSalonServiceBookingStatusDto,
} from './dto/create_salon_service_booking.dto';
import { SalonServicesRepository } from 'src/salon_service/salon_service.repository';
import { SalonServicesCategoriesRepository } from 'src/salon_service_categories/salon_service_categories.repository';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { NotificationService } from 'src/notification/notification.service';
import { BookingGateway } from './salon_service_booking_gateway';
import { InjectModel } from '@nestjs/mongoose';
import {
  BookingTransaction,
  BookingTransactionDocument,
} from 'src/schemas/transactions/booking-transaction.schema';
import { Model, Types } from 'mongoose';
import { SalonServiceBooking } from 'src/schemas/salon/salon_service_booking.schema';
@Injectable()
export class SalonServiceBookingService {
  constructor(
    private readonly bookingRepository: SalonServiceBookingRepository,
    private readonly salonServiceRepository: SalonServicesRepository,
    private readonly salonServiceCategoryRepository: SalonServicesCategoriesRepository,

    private readonly notificationService: NotificationService,
    private readonly bookingGateway: BookingGateway,

    @InjectModel(BookingTransaction.name)
    private readonly bookingTransactionModel: Model<BookingTransactionDocument>,
  ) {}

  async createBooking(
    bookingData: CreateSalonServiceBookingDto,
  ): Promise<{ booking: SalonServiceBooking; message: string }> {
    const {
      serviceId,
      finalPrice,
      bookingDate,
      bookingTime,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      payment,
    } = bookingData;

    // 1. Validate service
    const service = await this.salonServiceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found.`);
    }

    const cat = await this.salonServiceCategoryRepository.findById(
      service.categoryId,
    );

    // 2. Validate price
    const total = service.discountPercentage
      ? service.actualPrice -
        (service.actualPrice * service.discountPercentage) / 100
      : service.actualPrice;

    if (total !== finalPrice) {
      throw new BadRequestException(
        `Invalid final price. The correct price is ${total}`,
      );
    }

    // 3. Create booking transaction
    const bookingTransaction = (await this.bookingTransactionModel.create({
      transactionId:
        paymentMethod === 'Pay at Counter'
          ? `COD-${Date.now()}`
          : payment?.transactionId || `TXN-${Date.now()}`,
      customerEmail: customerEmail,
      amount: finalPrice.toString(),
      currency: 'PKR',
      status: payment?.status || 'Pending',
      paymentGateway: payment?.gateway || paymentMethod,
    })) as BookingTransaction & { _id: Types.ObjectId };

    // 4. Create booking
    const newBooking = {
      serviceName: service.name,
      serviceDuration: service.duration,
      serviceDescription: service.description,
      salonId: service.salonId,
      categoryId: service.categoryId,
      categoryName: cat.category,
      subCategoryName: service.subCategoryName,
      subSubCategoryName: service.subSubCategoryName,
      isDiscounted: service.hasDiscount,
      discountPercentage: service.discountPercentage,
      actualPrice: service.actualPrice,
      finalPrice: finalPrice,
      bookingStatus: 'Pending',
      bookingDate: new Date(bookingDate),
      bookingTime: bookingTime,
      isPaid: paymentMethod === 'Prepaid (Card)',
      paymentMethod: paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      transaction: bookingTransaction._id as Types.ObjectId,
    };

    const savedBooking = await this.bookingRepository.create(newBooking);

    // 5. Send notification
    await this.notificationService.create(
      savedBooking.salonId,
      `A new salon appointment has been booked by ${
        savedBooking.customerName || 'a customer'
      }. Please review the details. Salon ID: ${savedBooking.salonId}`,
      savedBooking,
    );

    console.log('Saved Booking: ', savedBooking);

    // 6. Emit WebSocket booking notification
    this.bookingGateway.sendBookingNotification(savedBooking);

    return { booking: savedBooking, message: 'Successfully Created Booking' };
  }

  async getAllBookings(query: any) {
    const filter: any = {};
    if (query.status) {
      filter.bookingStatus = query.status;
    }
    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }

    if (query?.salonId) {
      filter.salonId = query.salonId;
    }

    if (query.subCategoryName) {
      filter.subCategoryName = query.subCategoryName;
    }

    if (query.subSubCategoryName) {
      filter.subSubCategoryName = query.subSubCategoryName;
    }

    if (query.customerName) {
      filter.customerName = query.customerName;
    }

    if (query.serviceName) {
      filter.serviceName = query.serviceName;
    }
    const page = parseInt(query.page_no, 10) || 1;

    return await this.bookingRepository.findAll(filter, page);
  }
  async getAllSalonBookings(query: any, salon_payload?: AuthPayload) {
    console.log(salon_payload, ':pak');
    const filter: any = { salonId: salon_payload?._id };
    if (query.status) {
      filter.bookingStatus = query.status;
    } else {
      filter.bookingStatus = { $ne: 'Pending' }; // Exclude "pending" status when no status is provided
    }
    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }

    if (query?.salonId) {
      filter.salonId = query.salonId;
    }

    if (query.subCategoryName) {
      filter.subCategoryName = query.subCategoryName;
    }

    if (query.subSubCategoryName) {
      filter.subSubCategoryName = query.subSubCategoryName;
    }

    if (query.customerName) {
      filter.customerName = { $regex: new RegExp(query.customerName, 'i') };
    }

    if (query.serviceName) {
      filter.serviceName = { $regex: new RegExp(query.serviceName, 'i') };
    }
    console.log(filter, 'filter');
    const page = parseInt(query.page_no, 10) || 1;

    return await this.bookingRepository.findAll(filter, page);
  }
  async getAllSalonBookingStatus(query: any, salon_payload?: AuthPayload) {
    console.log(salon_payload, ':pak');
    const filter: any = { salonId: salon_payload?._id };

    if (query.status) {
      filter.bookingStatus = query.status;
    }

    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }

    if (query?.salonId) {
      filter.salonId = query.salonId;
    }

    if (query.subCategoryName) {
      filter.subCategoryName = query.subCategoryName;
    }

    if (query.subSubCategoryName) {
      filter.subSubCategoryName = query.subSubCategoryName;
    }

    console.log(filter, 'filter');
    const page = parseInt(query.page_no, 10) || 1;

    // Fetch the result (contains bookings array)
    const result = await this.bookingRepository.findAll(filter, page);

    // Extract bookings array
    const bookings = result.bookings || [];

    // Initialize accumulation variables
    let totalFinalPrice = 0;
    let accumulatedPendingStatus = 0;
    let accumulatedRejectedStatus = 0;
    let accumulatedApprovedStatus = 0;
    let accumulatedCompletedStatus = 0;
    let accumulatedCompleteAndPaidStatus = 0;

    // Loop through bookings to calculate totals
    bookings.forEach(
      (booking: { finalPrice: number; bookingStatus: string }) => {
        totalFinalPrice += booking.finalPrice || 0;

        switch (booking.bookingStatus) {
          case 'Pending':
            accumulatedPendingStatus++;
            break;
          case 'Rejected':
            accumulatedRejectedStatus++;
            break;
          case 'Approved':
            accumulatedApprovedStatus++;
            break;
          case 'Completed':
            accumulatedCompletedStatus++;
            break;
          case 'Completed And Paid':
            accumulatedCompleteAndPaidStatus++;
            break;
        }
      },
    );

    return {
      ...result, // Includes bookings, total, currentPage, totalPages
      totalFinalPrice, // Sum of finalPrice
      accumulatedPendingStatus,
      accumulatedRejectedStatus,
      accumulatedApprovedStatus,
      accumulatedCompletedStatus,
      accumulatedCompleteAndPaidStatus,
    };
  }

  async getBookingById(bookingId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }
    return booking;
  }
  async approveBooking(bookingId: string) {
    const updatedBooking = await this.bookingRepository.update(bookingId, {
      bookingStatus: 'Approved',
    });
    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }
    return updatedBooking;
  }
  async rejectBooking(bookingId: string) {
    const updatedBooking = await this.bookingRepository.update(bookingId, {
      bookingStatus: 'Rejected',
    });
    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }
    return updatedBooking;
  }

  async updateApprovedBookingStatus(
    updateData: UpdateSalonServiceBookingStatusDto,
  ) {
    const booking = await this.bookingRepository.findById(updateData.bookingId);

    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${updateData.bookingId} not found.`,
      );
    }

    if (
      booking.bookingStatus === 'Completed' ||
      booking.bookingStatus === 'Completed And Paid' ||
      booking.bookingStatus === 'Did not show up'
    ) {
      throw new BadRequestException(
        `Cannot update booking status as it is already marked as ${booking.bookingStatus}.`,
      );
    }

    if (booking.bookingStatus === 'Rejected') {
      throw new BadRequestException(`Cannot update a rejected booking.`);
    }
    if (booking.bookingStatus === 'Pending') {
      throw new BadRequestException(`Booking needs to be approved first.`);
    }
    if (
      updateData.bookingStatus === 'Completed' &&
      booking.paymentMethod != 'Prepaid (Card)'
    ) {
      throw new BadRequestException(
        `A booking can only be marked as 'Completed' if the payment was made via 'Prepaid (Card)'. This booking uses '${booking.paymentMethod}'.`,
      );
    }
    if (
      updateData.bookingStatus === 'Completed And Paid' &&
      booking.paymentMethod != 'Pay at Counter'
    ) {
      throw new BadRequestException(
        `A booking can only be marked as 'Completed And Paid' if the payment was made via 'Pay at Counter'. This booking uses '${booking.paymentMethod}'.`,
      );
    }

    const updatedBooking = await this.bookingRepository.update(
      updateData.bookingId,
      { bookingStatus: updateData.bookingStatus },
    );

    if (!updatedBooking) {
      throw new NotFoundException(
        `Booking with ID ${updateData.bookingId} could not be updated.`,
      );
    }

    return updatedBooking;
  }

  async updateBooking(bookingId: string, updateData: any) {
    const updatedBooking = await this.bookingRepository.update(
      bookingId,
      updateData,
    );
    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }
    return updatedBooking;
  }

  async deleteBooking(bookingId: string) {
    const deletedBooking = await this.bookingRepository.delete(bookingId);
    if (!deletedBooking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }
    return deletedBooking;
  }
}
