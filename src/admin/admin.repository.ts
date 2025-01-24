import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';
import { CreateAdminDto } from './dtos/request_dtos/create_admin.dto';
import { Admin, AdminProjection } from 'src/schemas/admin/admin.schema';

@Injectable()
export class AdminRepository{
  constructor(@InjectModel(Admin.name) private admin_model: Model<Admin>) {}

  async create_admin(dto: CreateAdminDto) {
    const admin = new this.admin_model(dto);
    return admin.save();
  }

  async get_admin_by_email(email: string, projection?: AdminProjection) {
    return this.admin_model.findOne({ email }, projection).exec();
  }

  async get_admin_by_id(_id: Types.ObjectId, projection?: AdminProjection) {
    return this.admin_model.findOne({ _id }, projection).exec();
  }

  async get_all_admin(page_no: number, projection?: AdminProjection) {
    const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;

    return await this.admin_model
      .find({}, projection)
      .skip(skip)
      .limit(DEFAULT_DOCUMENTS_LIMITS)
      .exec();
  }

  async delete_admin_by_id(_id: Types.ObjectId) {
    return this.admin_model.deleteOne({ _id }).exec();
  }

  async update_admin(id: Types.ObjectId, admin_dto: Partial<Omit<CreateAdminDto,"password">>) {
    return this.admin_model
      .findByIdAndUpdate(
        { _id: id },
        admin_dto,
        { new: true, runValidators: true }, // `new: true` ensures we get the updated document
      )
      .exec();
  }
}
