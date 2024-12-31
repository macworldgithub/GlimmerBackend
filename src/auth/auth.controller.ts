import { Body, ClassSerializerInterceptor, Controller, HttpCode, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateStoreDto } from 'src/store/dtos/store.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
    constructor(private auth_service: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('signin/store')
    signIn(@Body() create_store_dto: CreateStoreDto) {
        return this.auth_service.store_signup(create_store_dto)
    }
}
