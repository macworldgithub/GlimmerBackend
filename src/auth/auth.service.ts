import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateStoreDto } from 'src/store/dtos/store.dto';
import { StoreRepository } from 'src/store/store.repository';
import { Roles } from './enums/roles.enum';
import { Store } from 'src/schemas/ecommerce/store.schema';
import { StoreSignUpResponseDto } from './dtos/resonse_dtos/signup_response.dto';
import { comparePassword, hashPassword } from 'src/utils/data.encryption';
import { StoreSignInDto } from './dtos/request_dtos/signin_dto';
import { AuthPayload } from './payloads/auth.payload';

@Injectable()
export class AuthService {
    constructor(private store_repository: StoreRepository, private jwt_service: JwtService) { }

    async store_signup(create_store_dto: CreateStoreDto): Promise<StoreSignUpResponseDto> {
        try {

            const is_email_available = (await this.store_repository.get_store_by_email(create_store_dto.email))

            if (is_email_available?.email) {
                throw new BadRequestException("Email Already exists!")
            }

            create_store_dto.password = await hashPassword(create_store_dto.password)

            const inserted_store = await this.store_repository.create_store(create_store_dto)

            if (!inserted_store._id) {
                throw new InternalServerErrorException();
            }


            const token = await this.jwt_service.signAsync({
                _id: inserted_store._id.toString(),
                email: inserted_store.email,
                role: Roles.STORE
            });

            return { store: new Store(inserted_store), token }
        } catch (e) {
            throw new BadRequestException(e)
        }
    }

    async store_signin(signin_dto: StoreSignInDto): Promise<StoreSignUpResponseDto> {
        try {
            const store = await this.store_repository.get_store_by_email(signin_dto.email)

            if (!store?.email) {
                throw new BadRequestException('Incorrect email or password')
            }

            const isPasswordValid = await comparePassword(signin_dto.password, store.password)

            if (!isPasswordValid) {
                throw new BadRequestException('Incorrect email or password')
            }

            const payload: AuthPayload = {
                _id: store._id.toString(),
                email: store.email,
                role: Roles.STORE
            }

            const token = await this.jwt_service.signAsync(payload)

            return { store: new Store(store), token }
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
