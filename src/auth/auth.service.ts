import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateStoreDto } from 'src/store/dtos/store.dto';
import { StoreRepository } from 'src/store/store.repository';
import { Roles } from './enums/roles.enum';
import { Store } from 'src/schemas/ecommerce/store.schema';
import {
  CustomerSignUpResponseDto,
  StoreSignUpResponseDto,
} from './dtos/resonse_dtos/signup_response.dto';
import { comparePassword, hashPassword } from 'src/utils/data.encryption';
import {
  CustomerSignInDto,
  StoreSignInDto,
} from './dtos/request_dtos/signin_dto.dto';
import { AuthPayload } from './payloads/auth.payload';
import { CreateCustomerDto } from 'src/customer/dtos/req_dtos/create_customer.dto';
import { CustomerRepository } from 'src/customer/customer.repository';
import { Customer } from 'src/schemas/customer.schema';
import { S3Service } from 'src/aws/s3.service';
import { StoreService } from 'src/store/store.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private store_repository: StoreRepository,
    private jwt_service: JwtService,
    private customer_repository: CustomerRepository,
    private s3_service: S3Service,
    private firebase_service: FirebaseService,
  ) {}

  async store_signup(
    create_store_dto: CreateStoreDto,
  ): Promise<StoreSignUpResponseDto> {
    try {
      const is_email_available = await this.store_repository.get_store_by_email(
        create_store_dto.email,
      );

      if (is_email_available?.email) {
        throw new BadRequestException('Email Already exists!');
      }

      create_store_dto.password = await hashPassword(create_store_dto.password);
      const store_image_temp = create_store_dto.store_image;
      delete create_store_dto.store_image;

      const inserted_store =
        await this.store_repository.create_store(create_store_dto);

      if (store_image_temp) {
        const path = StoreService.GET_STORE_IMAGE_PATH(
          inserted_store._id.toString(),
        );
        const store_image = (
          await this.s3_service.upload_file_by_key(store_image_temp, path)
        ).Key;
        this.store_repository.update_store(inserted_store._id, { store_image });
        inserted_store.store_image =
          await this.s3_service.get_image_url(store_image);
      }

      if (!inserted_store._id) {
        throw new InternalServerErrorException();
      }

      const token = await this.jwt_service.signAsync({
        _id: inserted_store._id.toString(),
        email: inserted_store.email,
        role: Roles.STORE,
      });

      return { store: new Store(inserted_store), token, role: Roles.STORE };
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  async store_signin(
    signin_dto: StoreSignInDto,
  ): Promise<StoreSignUpResponseDto> {
    try {
      const store = await this.store_repository.get_store_by_email(
        signin_dto.email,
      );

      if (!store?.email) {
        throw new BadRequestException('Incorrect email or password');
      }

      const isPasswordValid = await comparePassword(
        signin_dto.password,
        store.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Incorrect email or password');
      }

      const payload: AuthPayload = {
        _id: store._id.toString(),
        email: store.email,
        role: Roles.STORE,
      };

      const token = await this.jwt_service.signAsync(payload);

      return { store: new Store(store), token, role: Roles.STORE };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async customer_signup(create_customer_dto: CreateCustomerDto): Promise<any> {
    try {
      const is_email_available =
        await this.customer_repository.get_customer_by_email(
          create_customer_dto.email,
        );

      if (is_email_available?.email) {
        throw new BadRequestException('Email Already exists!');
      }

      create_customer_dto.password = await hashPassword(
        create_customer_dto.password,
      );

      const inserted_customer =
        await this.customer_repository.create_customer(create_customer_dto);

      if (!inserted_customer._id) {
        throw new InternalServerErrorException();
      }

      const token = await this.jwt_service.signAsync({
        _id: inserted_customer._id.toString(),
        email: inserted_customer.email,
        role: Roles.CUSTOMER,
      });

      return {
        customer: new Customer(inserted_customer),
        token,
        role: Roles.CUSTOMER,
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async customer_signin(
    customer_signin_dto: CustomerSignInDto,
  ): Promise<CustomerSignUpResponseDto> {
    try {
      const customer = await this.customer_repository.get_customer_by_email(
        customer_signin_dto.email,
      );

      if (!customer?.email) {
        throw new BadRequestException('Incorrect email or password');
      }

      if (customer.password) {
        const isPasswordValid = await comparePassword(
          customer_signin_dto.password,
          customer.password,
        );

        if (!isPasswordValid) {
          throw new BadRequestException('Incorrect email or password');
        }
      }

      const payload: AuthPayload = {
        _id: customer._id.toString(),
        email: customer.email,
        role: Roles.CUSTOMER,
      };

      const token = await this.jwt_service.signAsync(payload);

      return { customer: new Customer(customer), token, role: Roles.CUSTOMER };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async oauth_customer_signup(
    customer: Omit<CreateCustomerDto, 'password'>,
  ): Promise<any> {
    try {
      const inserted_customer =
        await this.customer_repository.create_customer(customer);

      if (!inserted_customer._id) {
        throw new InternalServerErrorException();
      }

      const token = await this.jwt_service.signAsync({
        _id: inserted_customer._id.toString(),
        email: inserted_customer.email,
        role: Roles.CUSTOMER,
      });

      return {
        customer: new Customer(inserted_customer),
        token,
        role: Roles.CUSTOMER,
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async oauth_customer_signin(
    customer_dto: Omit<CustomerSignInDto, 'password'>,
  ): Promise<any> {
    try {
      const customer = await this.customer_repository.get_customer_by_email(
        customer_dto.email,
      );

      if (!customer?.email) {
        throw new BadRequestException('Incorrect email or password');
      }

      const payload: AuthPayload = {
        _id: customer._id.toString(),
        email: customer.email,
        role: Roles.CUSTOMER,
      };

      const token = await this.jwt_service.signAsync(payload);

      return { customer: new Customer(customer), token, role: Roles.CUSTOMER };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async customer_signup_with_google(id_token: string): Promise<any> {
    try {
      const credentials =
        await this.firebase_service.login_with_google(id_token);

      if (!credentials.user.email || !credentials.user.displayName) {
        throw new InternalServerErrorException('could not login with google');
      }
      const email_already_exist =
        await this.customer_repository.get_customer_by_email(
          credentials.user.email,
        );

      if (!email_already_exist) {
        return this.oauth_customer_signup({
          email: credentials.user.email,
          name: credentials.user.displayName,
        });
      }
      return this.oauth_customer_signin({ email: credentials.user.email });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
