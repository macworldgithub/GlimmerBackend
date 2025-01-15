import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Store, StoreProjection } from 'src/schemas/ecommerce/store.schema';
import { CreateStoreDto } from './dtos/store.dto';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';

@Injectable()
export class StoreRepository {
  constructor(@InjectModel(Store.name) private store_model: Model<Store>) {}

  async create_store(store_dto: CreateStoreDto) {
    const store = new this.store_model(store_dto);
    return store.save();
  }

  async get_store_by_email(email: string, projection?: StoreProjection) {
    return this.store_model.findOne({ email }, projection).exec();
  }

  async get_store_by_id(_id: Types.ObjectId, projection?: StoreProjection) {
    return this.store_model.findOne({ _id }, projection).exec();
  }

  async get_all_stores(page_no: number, projection?: StoreProjection) {
    const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;

    return await this.store_model
      .find({}, projection)
      .skip(skip)
      .limit(DEFAULT_DOCUMENTS_LIMITS)
      .exec();
  }

  async delete_store_by_id(_id: Types.ObjectId) {
    return this.store_model.deleteOne({ _id }).exec();
  }

  async update_store(id: Types.ObjectId, store_dto: Record<string, any>) {
    return this.store_model
      .findByIdAndUpdate(
        { _id: id },
        store_dto,
        { new: true, runValidators: true }, // `new: true` ensures we get the updated document
      )
      .exec();
  }

  async get_total_no_stores(
    filters?: Partial<Store>,
    session?: ClientSession | null,
  ) {
    if (!session) session = null;

    return this.store_model
      .countDocuments({
        ...filters,
      })
      .session(session)
      .exec();
  }
}
