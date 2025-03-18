import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/aws/s3.service';
import { SalonRepository } from './salon.repository';

@Injectable()
export class SalonService {
    constructor(
        private salon_repository:SalonRepository,
        private s3_service: S3Service,
    ){

    }

    public static readonly GET_SALON_IMAGE_PATH = (id: string) => {
        return 'glimmer/brands/' + id + '/salon_image/image1';
      };
}
