import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { StoreRepository } from './store.repository';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import { Store, StoreProjection, UpdateStoreDto } from 'src/schemas/ecommerce/store.schema';
import { Types } from 'mongoose';
import { DeleteResponse } from 'src/commons/dtos/response_dtos/delete.dto';
import { PaginatedDataDto } from 'src/commons/dtos/request_dtos/pagination.dto';
import { validate } from 'class-validator';

@Injectable()
export class StoreService {
    constructor(private store_repository: StoreRepository) { }

    async get_store_by_id(store_payload: AuthPayload, projection?: StoreProjection): Promise<Store> {
        try {

            const store = await this.store_repository.get_store_by_id(new Types.ObjectId(store_payload._id), projection)

            if (!store) {
                throw new BadRequestException("Store doesnot exist")
            }

            return new Store(store)

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }


    async delete_store_by_id(store_payload: AuthPayload): Promise<DeleteResponse> {
        try {

            const store = await this.store_repository.delete_store_by_id(new Types.ObjectId(store_payload._id))

            if (!store.deletedCount) {
                throw new BadRequestException("store couldnot be deleted!")
            }

            return { ...store, message: "success" }

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }


    async get_all_stores(page_no: number, projection?: StoreProjection): Promise<Store[]> {
        try {

            const params = new PaginatedDataDto(page_no)

            const is_valid = await validate(params, {
                validationError: { target: false },
            })
            if (is_valid.length) {
                throw new BadRequestException("Incorrect page no value")
            }

            const stores = await this.store_repository.get_all_stores(page_no, projection)

            if (!stores) {
                throw new BadRequestException("Product doesnot exist")
            }

            return stores.map(elem => new Store(elem))

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async update_store(store_payload: AuthPayload, update_store_dto: UpdateStoreDto): Promise<Store> {
        try {

            const store = await this.store_repository.update_store(new Types.ObjectId(store_payload._id), update_store_dto)
            if (!store) {
                throw new BadRequestException("Store coulnot be updated")
            }

            return new Store(store)

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
