import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SalonServiceBookingRepository } from './salon_service_booking.repository';
import { CreateSalonServiceBookingDto, UpdateSalonServiceBookingStatusDto } from './dto/create_salon_service_booking.dto';
import { SalonServicesRepository } from 'src/salon_service/salon_service.repository';
import { SalonServicesCategoriesRepository } from 'src/salon_service_categories/salon_service_categories.repository';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
@Injectable()
export class SalonServiceBookingService {
  constructor(private readonly bookingRepository: SalonServiceBookingRepository,
    private readonly salonServiceRepository: SalonServicesRepository,
    private readonly salonServiceCategoryRepository: SalonServicesCategoriesRepository,
  ) {}

  async createBooking(bookingData:CreateSalonServiceBookingDto) {
    const { serviceId, finalPrice,bookingDate,paymentMethod, ...otherData } = bookingData;
    const service = await this.salonServiceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found.`);
    }
    const cat = await this.salonServiceCategoryRepository.findById(service.categoryId);
    console.log(cat)
    let total = service.discountPercentage ? service.actualPrice - (service.actualPrice * service.discountPercentage) / 100 : service.actualPrice;

    if(total!=finalPrice){
      throw new BadRequestException(`Invalid final price. The correct price is ${total}`);
    }
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
      bookingDate:new Date(bookingDate),
      isPaid:paymentMethod=="Prepaid (Card)",
      paymentMethod:paymentMethod,
      ...otherData,
    };
    return this.bookingRepository.create(newBooking);
  }

  async getAllBookings(query:any) {
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
    const page = parseInt(query.page_no, 10) || 1;

    return await this.bookingRepository.findAll(filter,page);
  }
  async getAllSalonBookings(query:any,salon_payload?:AuthPayload) {
    console.log(salon_payload,":pak")
    const filter: any = {salonId:salon_payload?._id};
    if (query.status) {
      filter.bookingStatus = query.status;
    } else {
      filter.bookingStatus = { $ne: "Pending" }; // Exclude "pending" status when no status is provided
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
    console.log(filter,"filter")
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
    bookings.forEach((booking: { finalPrice: number; bookingStatus: string }) => {
        totalFinalPrice += booking.finalPrice || 0;

        switch (booking.bookingStatus) {
            case "Pending":
                accumulatedPendingStatus++;
                break;
            case "Rejected":
                accumulatedRejectedStatus++;
                break;
            case "Approved":
                accumulatedApprovedStatus++;
                break;
            case "Completed":
                accumulatedCompletedStatus++;
                break;
            case "Completed And Paid":
                accumulatedCompleteAndPaidStatus++;
                break;
        }
    });

    return {
        ...result, // Includes bookings, total, currentPage, totalPages
        totalFinalPrice, // Sum of finalPrice
        accumulatedPendingStatus,
        accumulatedRejectedStatus,
        accumulatedApprovedStatus,
        accumulatedCompletedStatus,
        accumulatedCompleteAndPaidStatus
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
    const updatedBooking = await this.bookingRepository.update(bookingId, {bookingStatus:"Approved"});
    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }
    return updatedBooking;
  }
  async rejectBooking(bookingId: string) {
    const updatedBooking = await this.bookingRepository.update(bookingId, {bookingStatus:"Rejected"});
    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }
    return updatedBooking;
  }

  async updateApprovedBookingStatus(updateData: UpdateSalonServiceBookingStatusDto) {
    const booking = await this.bookingRepository.findById(updateData.bookingId);

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${updateData.bookingId} not found.`);
    }

    if (booking.bookingStatus === 'Completed' || booking.bookingStatus === 'Completed And Paid' || booking.bookingStatus === 'Did not show up') {
      throw new BadRequestException(`Cannot update booking status as it is already marked as ${booking.bookingStatus}.`);
    }

    if (booking.bookingStatus === 'Rejected') {
      throw new BadRequestException(`Cannot update a rejected booking.`);
    }
    if (booking.bookingStatus === 'Pending') {
      throw new BadRequestException(`Booking needs to be approved first.`);
    }
    if (updateData.bookingStatus === 'Completed' && booking.paymentMethod != 'Prepaid (Card)' ) {
      throw new BadRequestException(`A booking can only be marked as 'Completed' if the payment was made via 'Prepaid (Card)'. This booking uses '${booking.paymentMethod}'.`);
    }
    if (updateData.bookingStatus === 'Completed And Paid' && booking.paymentMethod != 'Pay at Counter' ) {
      throw new BadRequestException(`A booking can only be marked as 'Completed And Paid' if the payment was made via 'Pay at Counter'. This booking uses '${booking.paymentMethod}'.`);
    }

    const updatedBooking = await this.bookingRepository.update(updateData.bookingId, { bookingStatus: updateData.bookingStatus });

    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${updateData.bookingId} could not be updated.`);
    }

    return updatedBooking;
  }

  async updateBooking(bookingId: string, updateData:any) {
    const updatedBooking = await this.bookingRepository.update(bookingId, updateData);
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
