import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { CreateSalonDto } from './dto/salon.dto';
import {
  Salon,
  SalonProjection,
  SalonDocument,
} from 'src/schemas/salon/salon.schema';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';

@Injectable()
export class SalonRepository {
  constructor(
    @InjectModel(Salon.name) private salon_model: Model<SalonDocument>,
  ) {}

  async create_salon(salon_dto: CreateSalonDto): Promise<SalonDocument> {
    const salon = new this.salon_model(salon_dto);
    return salon.save();
  }

  async get_salon_by_email(
    email: string,
    projection?: SalonProjection,
  ): Promise<SalonDocument | null> {
    return this.salon_model.findOne({ email }, projection).exec();
  }

  async get_salon_by_id(
    _id: any,
    projection?: SalonProjection,
  ) {
    return this.salon_model.findOne({ _id }, projection).lean().exec();
  }

  async get_all_salons(
    page_no: number,
    projection?: SalonProjection,
  ) {
    const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;
    let salons= await this.salon_model
      .find().lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(DEFAULT_DOCUMENTS_LIMITS)
      .exec();
      let total=await this.salon_model
      .countDocuments()
      return {total,salons}
  }

  async delete_salon_by_id(
    _id: Types.ObjectId,
  ): Promise<{ deletedCount?: number }> {
    return this.salon_model.deleteOne({ _id }).exec();
  }

  async update_salon(
    id: Types.ObjectId,
    salon_dto: Partial<Salon>,
  ): Promise<SalonDocument | null> {
    return this.salon_model
      .findByIdAndUpdate(id, salon_dto, { new: true })
      .exec();
  }

  async get_total_no_salons(
    filters?: Partial<Salon>,
    session?: ClientSession | null,
  ): Promise<number> {
    return this.salon_model
      .countDocuments(filters || {})
      .session(session || null)
      .exec();
  }
}
