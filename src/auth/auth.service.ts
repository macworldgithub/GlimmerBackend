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
  AdminSignUpResponseDto,
  CustomerSignUpResponseDto,
  StoreSignUpResponseDto,
  SalonSignUpResponseDto,
} from './dtos/resonse_dtos/signup_response.dto';
import { comparePassword, hashPassword } from 'src/utils/data.encryption';
import {
  AdminSigninDto,
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
import { AdminRepository } from 'src/admin/admin.repository';
import { CreateAdminDto } from 'src/admin/dtos/request_dtos/create_admin.dto';
import { Admin } from 'src/schemas/admin/admin.schema';
import { SalonRepository } from 'src/salon/salon.repository';
import { CreateSalonDto } from 'src/salon/dto/salon.dto';
import { Salon, SalonDocument } from 'src/schemas/salon/salon.schema';
import { SalonService } from 'src/salon/salon.service';
import mongoose from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private store_repository: StoreRepository,
    private salon_repository: SalonRepository,
    private jwt_service: JwtService,
    private customer_repository: CustomerRepository,
    private s3_service: S3Service,
    private firebase_service: FirebaseService,
    private admin_repository: AdminRepository,
  ) {}

  async salon_signup(
    create_salon_dto: CreateSalonDto,
  ): Promise<SalonSignUpResponseDto> {
    try {
      // Check if the email already exists
      const is_email_available = await this.salon_repository.get_salon_by_email(
        create_salon_dto.email,
      );
      if (is_email_available?.email) {
        throw new BadRequestException('Email already exists!');
      }

      // Hash the password
      create_salon_dto.password = await hashPassword(create_salon_dto.password);
 
      const temp_id = new mongoose.Types.ObjectId();
      const path = SalonService.GET_SALON_IMAGE_PATH(
        //@ts-ignore
        temp_id.toString(),
      );
 
      let salon_temp:any = structuredClone(create_salon_dto);
      if (create_salon_dto.image1) {
        salon_temp.image1 = (
          await this.s3_service.upload_file(create_salon_dto.image1, path)
        ).Key;
      }
      if (create_salon_dto.image2) {
        salon_temp.image2 = (
          await this.s3_service.upload_file(create_salon_dto.image2, path)
        ).Key;
      }
      if (create_salon_dto.image3) {
        salon_temp.image3 = (
          await this.s3_service.upload_file(create_salon_dto.image3, path)
        ).Key;
      }
      if (create_salon_dto.image4) {
        salon_temp.image4 = (
          await this.s3_service.upload_file(create_salon_dto.image4, path)
        ).Key;
      }
      

      const inserted_salon: SalonDocument =
      await this.salon_repository.create_salon({
        ...salon_temp,
        _id: temp_id, 
      });
      if (!inserted_salon._id) {
        throw new InternalServerErrorException();
      }

      if (inserted_salon.image1) {
        inserted_salon.image1 = await this.s3_service.get_image_url(inserted_salon.image1);
      }
      if (inserted_salon.image2) {
        inserted_salon.image2 = await this.s3_service.get_image_url(inserted_salon.image2);
      }
      if (inserted_salon.image3) {
        inserted_salon.image3 = await this.s3_service.get_image_url(inserted_salon.image3);
      }
      if (inserted_salon.image4) {
        inserted_salon.image4 = await this.s3_service.get_image_url(inserted_salon.image4);
      }
      delete create_salon_dto.image1;
      delete create_salon_dto.image2;
      delete create_salon_dto.image3;
      delete create_salon_dto.image4;


      // Generate a JWT token for the newly registered salon
      const token = await this.jwt_service.signAsync({
        _id: inserted_salon._id.toString(),
        email: inserted_salon.email,
        role: Roles.SALON,
      });

     
      //@ts-ignore
      return { salon: new Salon(inserted_salon), token, role: Roles.SALON };
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e);
    }
  }
  async salon_signin(
    signin_dto: StoreSignInDto,
  ): Promise<SalonSignUpResponseDto> {
    try {
      const salon = await this.salon_repository.get_salon_by_email(
        signin_dto.email,
      );

      if (!salon?.email) {
        throw new BadRequestException('Incorrect email or password');
      }

      const isPasswordValid = await comparePassword(
        signin_dto.password,
        salon.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Incorrect email or password');
      }

      const payload: AuthPayload = {
        _id: salon._id.toString(),
        email: salon.email,
        role: Roles.SALON,
      };
     
      if (salon.image1) {
        salon.image1 = await this.s3_service.get_image_url(salon.image1);
      }
      if (salon.image2) {
        salon.image2 = await this.s3_service.get_image_url(salon.image2);
      }
      if (salon.image3) {
        salon.image3 = await this.s3_service.get_image_url(salon.image3);
      }
      if (salon.image4) {
        salon.image4 = await this.s3_service.get_image_url(salon.image4);
      }
      const token = await this.jwt_service.signAsync(payload);
      //@ts-ignore
      return { salon: new Salon(salon), token, role: Roles.SALON };
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }
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
      if (store.store_image) {
        store.store_image = await this.s3_service.get_image_url(store.store_image);
      }
      const payload: AuthPayload = {
        _id: store._id.toString(),
        email: store.email,
        role: Roles.STORE,
      };

      const token = await this.jwt_service.signAsync(payload);

      return { store: new Store(store), token, role: Roles.STORE };
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
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

  async admin_signup(
    create_admin_dto: CreateAdminDto,
  ): Promise<AdminSignUpResponseDto> {
    try {
      const is_email_available = await this.admin_repository.get_admin_by_email(
        create_admin_dto.email,
      );

      if (is_email_available?.email) {
        throw new BadRequestException('Email Already exists!');
      }

      create_admin_dto.password = await hashPassword(create_admin_dto.password);

      const inserted_admin =
        await this.admin_repository.create_admin(create_admin_dto);

      if (!inserted_admin._id) {
        throw new InternalServerErrorException();
      }

      const token = await this.jwt_service.signAsync({
        _id: inserted_admin._id.toString(),
        email: inserted_admin.email,
        role: Roles.SUPERADMIN,
      });

      return {
        admin: new Admin(inserted_admin),
        token,
        role: Roles.SUPERADMIN,
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async admin_signin(
    admin_signin_dto: AdminSigninDto,
  ): Promise<AdminSignUpResponseDto> {
    try {
      const admin = await this.admin_repository.get_admin_by_email(
        admin_signin_dto.email,
      );

      if (!admin) {
        throw new BadRequestException('Incorrect email or password');
      }

      const isPasswordValid = await comparePassword(
        admin_signin_dto.password,
        admin.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Incorrect email or password');
      }

      const payload: AuthPayload = {
        _id: admin._id.toString(),
        email: admin.email,
        role: Roles.SUPERADMIN,
      };

      const token = await this.jwt_service.signAsync(payload);

      return { admin: new Admin(admin), token, role: Roles.SUPERADMIN };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
