import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
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
//   @ApiBearerAuth()
//   @HttpCode(HttpStatus.OK)
//   @UseInterceptors(FileInterceptor('salon_image'))
//   @ApiConsumes('multipart/form-data')
//   @UseGuards(AuthGuard, RolesGuard)
//   @Role(Roles.SALON)
//   @Put('/get-all-salon')
//   async get_all_salon(
//     @Body() updateSalonDto: UpdateSaloonDto,
//     @Req()
//     req: AuthPayloadRequest,
//     @UploadedFile(new SingleImageSizeValidationPipe())
//     salon_image?: Express.Multer.File,
//   ) {
//     salon_image ? (updateSalonDto.salon_image = salon_image) : null;

//     return this.salon_service.updateSalon(updateSalonDto, req.user);
//   }
}
