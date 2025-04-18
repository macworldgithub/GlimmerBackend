import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SalonServiceBooking, SalonServiceBookingSchema } from 'src/schemas/salon/salon_service_booking.schema';


@Injectable()
export class SalonServiceBookingRepository {
  constructor(
    @InjectModel(SalonServiceBooking.name)
    private readonly salonServiceBookingModel: Model<SalonServiceBooking>,
  ) {}

  async create(bookingData: Partial<SalonServiceBooking>): Promise<SalonServiceBooking> {
    const booking = new this.salonServiceBookingModel(bookingData);
    return booking.save();
  }

  async findAll(filter:any,page:any) {
    // return this.salonServiceBookingModel.find(filter).exec();
    const limit = 10;
    const skip = (page - 1) * limit;
    const total = await this.salonServiceBookingModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);
    let bookings = await this.salonServiceBookingModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    return {
      bookings,
      total,
      currentPage: page,
      totalPages,
    };
  }

  async findById(bookingId: string): Promise<SalonServiceBooking | null> {
    return this.salonServiceBookingModel.findOne({ _id:bookingId }).exec();
  }

  async update(bookingId: string, updateData: Partial<SalonServiceBooking>): Promise<SalonServiceBooking | null> {
    return this.salonServiceBookingModel.findOneAndUpdate({ _id:bookingId  }, updateData, { new: true }).exec();
  }

  async delete(bookingId: string): Promise<SalonServiceBooking | null> {
    return this.salonServiceBookingModel.findOneAndDelete({ _id:bookingId  }).exec();
  }
}
