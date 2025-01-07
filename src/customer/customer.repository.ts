import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DEFAULT_DOCUMENTS_LIMITS } from 'src/constants/common.constants';
import { Customer, CustomerProjection } from 'src/schemas/customer.schema';
import { CreateCustomerDto } from './dtos/req_dtos/create_customer.dto';
import { UpdateCustomerDto } from './dtos/req_dtos/update_customer.dto';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectModel(Customer.name) private customer_model: Model<Customer>,
  ) {}

  async create_customer(customer_dto: CreateCustomerDto) {
    const customer = new this.customer_model(customer_dto);
    console.log(customer);

    return customer.save();
  }

  async get_customer_by_id(
    _id: Types.ObjectId,
    projection?: CustomerProjection,
  ) {
    return this.customer_model.findOne({ _id }, projection).exec();
  }

  async get_customer_by_email(email: string, projection?: CustomerProjection) {
    return this.customer_model.findOne({ email }, projection).exec();
  }

  async get_all_customers(page_no: number, projection?: CustomerProjection) {
    const skip = (page_no - 1) * DEFAULT_DOCUMENTS_LIMITS;

    return await this.customer_model
      .find({}, projection)
      .skip(skip)
      .limit(DEFAULT_DOCUMENTS_LIMITS)
      .exec();
  }

  async delete_customer_by_id(_id: Types.ObjectId) {
    return this.customer_model.deleteOne({ _id }).exec();
  }

  async update_customer(id: Types.ObjectId, customer_dto: UpdateCustomerDto) {
    return this.customer_model
      .findByIdAndUpdate(
        { _id: id },
        customer_dto,
        { new: true, runValidators: true }, // `new: true` ensures we get the updated document
      )
      .exec();
  }
}
