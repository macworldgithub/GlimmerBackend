import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types, ClientSession } from 'mongoose';

import { CreateSalonDto } from './dto/salon.dto';
import { Salon,SalonProjection ,SalonDocument } from 'src/schemas/salon/salon.schema';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';

@Injectable()
export class SalonRepository {
  constructor(@InjectModel(Salon.name) private salon_model: Model<SalonDocument>) {}

  async create_salon(salon_dto: CreateSalonDto) {
    const salon = new this.salon_model(salon_dto);
    return salon.save();
  }

  async get_salon_by_email(email: string, projection?: SalonProjection) {
    return this.salon_model.findOne({ email }, projection).exec();
  }

  async get_salon_by_id(_id: Types.ObjectId, projection?: SalonProjection) {
    return this.salon_model.findOne({ _id }, projection).exec();
  }

  async get_all_salons(page_no: number, projection?: SalonProjection) {
    const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;
    return this.salon_model
      .find({}, projection)
      .skip(skip)
      .limit(DEFAULT_DOCUMENTS_LIMITS)
      .exec();
  }

  async delete_salon_by_id(_id: Types.ObjectId) {
    return this.salon_model.deleteOne({ _id }).exec();
  }

  async update_salon(id: Types.ObjectId, salon_dto: Record<string, any>) {
    return this.salon_model
      .findByIdAndUpdate(
        { _id: id },
        salon_dto,
        { new: true, runValidators: true } // returns the updated document and validates update data
      )
      .exec();
  }

  async get_total_no_salons(
    filters?: Partial<Salon>,
    session?: ClientSession | null,
  ) {
    if (!session) session = null;
    return this.salon_model
      .countDocuments({ ...filters })
      .session(session)
      .exec();
  }
}
