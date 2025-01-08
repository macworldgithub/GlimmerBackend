import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    FileTypeValidator,
    Get,
    HttpCode,
    HttpStatus,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    Put,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import {
    Product,
    UpdateProductDto,
} from 'src/schemas/ecommerce/product.schema';
import { ProductService } from './product.service';
import { AuthPayloadRequest } from './interfaces/auth_payload_request.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductStatus } from './enums/product_status.enum';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Ecommerce Products')
@Controller('product')
export class ProductController {
    constructor(private product_service: ProductService) { }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @UseInterceptors(FilesInterceptor('images', 3))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                images: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary', // For file uploads
                    },
                },
                name: {
                    type: 'string',
                    example: 'Sample Product Name',
                },
                quantity: {
                    type: 'integer',
                    minimum: 1,
                    example: 10,
                },
                description: {
                    type: 'string',
                    nullable: true,
                    example: 'Optional product description',
                },
                base_price: {
                    type: 'number',
                    minimum: 0,
                    example: 100,
                },
                discounted_price: {
                    type: 'number',
                    minimum: 0,
                    example: 80,
                },
                status: {
                    type: 'string',
                    enum: [ProductStatus.ACTIVE, ProductStatus.INACTIVE], // Replace with your actual `ProductStatus` enums
                    example: 'Active',
                },
            },
            required: ['name', 'quantity', 'base_price', 'discounted_price', 'status'], // Required fields
        },
    })
    @Post('create')
    create_product(
        @Body() product_dto: Product,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1000 * 1024 * 5 }),
                    new FileTypeValidator({ fileType: /image\/.*/ }),
                ],
            }),
        )
        files: Array<Express.Multer.File>,
        @Req() req: AuthPayloadRequest,
    ) {
        return this.product_service.create_product(product_dto, req.user, files);
    }


    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Get('get_store_product_by_id')
    get_product_by_id(@Query('id') id: string, @Req() req: AuthPayloadRequest) {
        return this.product_service.get_store_product_by_id(id, req.user);
    }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Get('get_all_store_products')
    async get_all_store_products(
        @Req() req: AuthPayloadRequest,
        @Query('page_no') page_no: number,
    ) {
        return this.product_service.get_all_store_products(req.user, page_no);
    }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @Delete('delete_store_product_by_id')
    delete_product_by_id(
        @Query('id') id: string,
        @Req() req: AuthPayloadRequest,
    ) {
        return this.product_service.delete_store_product_by_id(id, req.user);
    }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Role(Roles.STORE)
    @UseInterceptors(FilesInterceptor('images', 3))
    @ApiConsumes('multipart/form-data')
    @Put('update_store_product_by_id')
    update_product_by_id(
        @Query('id') id: string,
        @Req() req: AuthPayloadRequest,
        @Body() body: UpdateProductDto,
    ) {
        console.log( body, req.file, req.files)
        return
        return this.product_service.update_store_product(id, req.user, body);
    }
}
