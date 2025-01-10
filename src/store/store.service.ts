import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { StoreRepository } from './store.repository';
import { AuthPayload } from 'src/auth/payloads/auth.payload';
import {
  Store,
  StoreProjection,
  UpdateStoreDto,
} from 'src/schemas/ecommerce/store.schema';
import { Types } from 'mongoose';
import { DeleteResponse } from 'src/commons/dtos/response_dtos/delete.dto';
import { PaginatedDataDto } from 'src/commons/dtos/request_dtos/pagination.dto';
import { validate } from 'class-validator';
import { S3Service } from 'src/aws/s3.service';

@Injectable()
export class StoreService {
  constructor(
    private store_repository: StoreRepository,
    private s3_service: S3Service,
  ) {}

  public static readonly GET_STORE_IMAGE_PATH = (id: string) => {
    return 'glimmer/brands/' + id + '/store_image/image1';
  };

  async get_store_by_id(
    store_payload: AuthPayload,
    projection?: StoreProjection,
  ): Promise<Store> {
    try {
      const store = await this.store_repository.get_store_by_id(
        new Types.ObjectId(store_payload._id),
        projection,
      );

      if (!store) {
        throw new BadRequestException('Store doesnot exist');
      }

      return new Store(store);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async delete_store_by_id(
    store_payload: AuthPayload,
  ): Promise<DeleteResponse> {
    try {
      const store = await this.store_repository.delete_store_by_id(
        new Types.ObjectId(store_payload._id),
      );

      if (!store.deletedCount) {
        throw new BadRequestException('store couldnot be deleted!');
      }

      return { ...store, message: 'success' };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async get_all_stores(
    page_no: number,
    projection?: StoreProjection,
  ): Promise<Store[]> {
    try {
      const params = new PaginatedDataDto(page_no);

      const is_valid = await validate(params, {
        validationError: { target: false },
      });
      if (is_valid.length) {
        throw new BadRequestException('Incorrect page no value');
      }

      const stores = await this.store_repository.get_all_stores(
        page_no,
        projection,
      );

      if (!stores) {
        throw new BadRequestException('Product doesnot exist');
      }

      return stores.map((elem) => new Store(elem));
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async update_store(
    store_payload: AuthPayload,
    update_store_dto: UpdateStoreDto,
  ): Promise<Store> {
    try {
      const update_obj: any = structuredClone(update_store_dto);

      if (update_store_dto.store_image) {
        const path = StoreService.GET_STORE_IMAGE_PATH(store_payload._id);
        const store_image = (
          await this.s3_service.upload_file_by_key(
            update_store_dto.store_image,
            path,
          )
        ).Key;
        update_obj.store_image = store_image;
      }

      const store = await this.store_repository.update_store(
        new Types.ObjectId(store_payload._id),
        update_obj,
      );
      if (!store) {
        throw new BadRequestException('Store coulnot be updated');
      }
      if (store.store_image) {
        store.store_image = await this.s3_service.get_image_url(
          store.store_image,
        );
      }

      return new Store(store);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
