import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateSalonDto, UpdateSaloonDto } from 'src/salon/dto/salon.dto';
import { SalonService } from './salon.service';
import { FileSizeValidationPipe, SingleImageSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';
import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/auth/roles.decorator';
import { Roles } from 'src/auth/enums/roles.enum';

@ApiTags('Salon')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('salon')
export class SalonController {
  constructor(private salon_service: SalonService) {}
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK) 
  @UseInterceptors(
        FileFieldsInterceptor([
          { name: 'image1', maxCount: 1 },
          { name: 'image2', maxCount: 1 },
          { name: 'image3', maxCount: 1 },
          { name: 'image4', maxCount: 1 },
        ]),
      )
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @Put('/update')
  async update_salon(
    @Body() updateSalonDto: UpdateSaloonDto,
    @Req() req: AuthPayloadRequest,
    @UploadedFiles(new FileSizeValidationPipe())
        files: {
          image1?: Express.Multer.File[];
          image2?: Express.Multer.File[];
          image3?: Express.Multer.File[];
          image4?: Express.Multer.File[];
        },
       ) {
        updateSalonDto.image1 = files.image1?.length ? files.image1[0] : undefined;
        updateSalonDto.image2 = files.image2?.length ? files.image2[0] : undefined;
        updateSalonDto.image3 = files.image3?.length ? files.image3[0] : undefined;
        updateSalonDto.image4 = files.image4?.length ? files.image4[0] : undefined;
    return this.salon_service.updateSalon(updateSalonDto, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/get-all-salon')
  @ApiOperation({ summary: 'Get all salon' })
  @ApiQuery({ name: 'page_no', type: String, required: true })
  @ApiQuery({ name: 'salon_name', type: String, required: false })
  async get_all_salon(@Query() query: any) {
    return this.salon_service.getAllSalon(query);
  }
  
  @HttpCode(HttpStatus.OK)
  @Get('/get-salon-by-id')
  @ApiOperation({ summary: 'Get a siingle salon by id' })
  @ApiQuery({ name: 'id', type: String, required: true })
  async get_a_salon_by_id(@Query() query: any) {
    return this.salon_service.getSalonById(query);
  }
}
