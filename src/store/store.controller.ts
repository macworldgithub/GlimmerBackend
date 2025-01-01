import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpStatus, Put, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';
import { StoreService } from './store.service';
import { UpdateStoreDto } from 'src/schemas/ecommerce/store.schema';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags("Store")
@Controller('store')
export class StoreController {
    constructor(private store_service : StoreService){ }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Get('get_store')
    get_store_by_id(@Req() req: AuthPayloadRequest) {
        return this.store_service.get_store_by_id(req.user)
    }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Delete('delete_store')
    delete_store_by_id(@Req() req: AuthPayloadRequest) {
        return this.store_service.delete_store_by_id(req.user)
    }


    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Put('update_store')
    update_store_by_id(@Req() req: AuthPayloadRequest, @Body() body: UpdateStoreDto) {
        return this.store_service.update_store(req.user, body)
    }


    // For Admin
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Get('get_all_stores')
    get_all_stores(@Query("page_no") page_no : number) {
        return this.store_service.get_all_stores(page_no)
    }


}
