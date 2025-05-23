// import {
//   Body,
//   ClassSerializerInterceptor,
//   Controller,
//   Get,
//   Delete,
//   HttpCode,
//   HttpStatus,
//   Patch,
// BadRequestException,
//   Post,
//   Put,
//   Query,
//   Req,
//   UploadedFile,
//   UploadedFiles,
//   UseGuards,
//   UseInterceptors,
// } from '@nestjs/common';
// import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
// import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags,ApiBody } from '@nestjs/swagger';
// import { CreateSalonDto, UpdateSaloonDto,UpdateSalonStatusDto } from 'src/salon/dto/salon.dto';
// import { SalonService } from './salon.service';
// import { FileSizeValidationPipe, SingleImageSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';
// import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';
// import { AuthGuard } from 'src/auth/auth.guard';
// import { RolesGuard } from 'src/auth/roles.guard';
// import { Role } from 'src/auth/roles.decorator';
// import { Roles } from 'src/auth/enums/roles.enum';
// import { Types } from 'mongoose';

// @ApiTags('Salon')
// @UseInterceptors(ClassSerializerInterceptor)
// @Controller('salon')
// export class SalonController {
//   constructor(private salon_service: SalonService) {}
//   @ApiBearerAuth()
//   @HttpCode(HttpStatus.OK) 
//   @UseInterceptors(
//         FileFieldsInterceptor([
//           { name: 'image1', maxCount: 1 },
//           { name: 'image2', maxCount: 1 },
//           { name: 'image3', maxCount: 1 },
//           { name: 'image4', maxCount: 1 },
//         ]),
//       )
//   @ApiConsumes('multipart/form-data')
//   @UseGuards(AuthGuard, RolesGuard)
//   @Role(Roles.SALON)
//   @Put('/update')
//   async update_salon(
//     @Body() updateSalonDto: UpdateSaloonDto,
//     @Req() req: AuthPayloadRequest,
//     @UploadedFiles(new FileSizeValidationPipe())
//         files: {
//           image1?: Express.Multer.File[];
//           image2?: Express.Multer.File[];
//           image3?: Express.Multer.File[];
//           image4?: Express.Multer.File[];
//         },
//        ) {
//         updateSalonDto.image1 = files.image1?.length ? files.image1[0] : undefined;
//         updateSalonDto.image2 = files.image2?.length ? files.image2[0] : undefined;
//         updateSalonDto.image3 = files.image3?.length ? files.image3[0] : undefined;
//         updateSalonDto.image4 = files.image4?.length ? files.image4[0] : undefined;
//     return this.salon_service.updateSalon(updateSalonDto, req.user);
//   }

//   @HttpCode(HttpStatus.OK)
//   @Get('/get-all-salon')
//   @ApiOperation({ summary: 'Get all salon' })
//   @ApiQuery({ name: 'page_no', type: String, required: true })
//   @ApiQuery({ name: 'salon_name', type: String, required: false })
//   async get_all_salon(@Query() query: any) {
//     return this.salon_service.getAllSalon(query);
//   }
  
//   @HttpCode(HttpStatus.OK)
//   @Get('/get-salon-by-id')
//   @ApiOperation({ summary: 'Get a siingle salon by id' })
//   @ApiQuery({ name: 'id', type: String, required: true })
//   async get_a_salon_by_id(@Query() query: any) {
//     return this.salon_service.getSalonById(query);
//   }
// @ApiBearerAuth()
//   @HttpCode(HttpStatus.OK)
//   @UseGuards(AuthGuard, RolesGuard)
//   @Role(Roles.SALON)
//   @Delete('/delete')
//   @ApiOperation({ summary: 'Delete a salon by authenticated user or superadmin' })
//   @ApiQuery({ name: 'salon_id', type: String, required: false, description: 'Salon ID (required for SUPERADMIN)' })
//   async delete_salon(
//     @Req() req: AuthPayloadRequest,
//     @Query('salon_id') salon_id?: string,
//   ) {
//     let targetSalonId: string;
//     if (req.user.role === Roles.SUPERADMIN) {
//       if (!salon_id) {
//         throw new BadRequestException('salon_id is required for SUPERADMIN');
//       }
//       if (!Types.ObjectId.isValid(salon_id)) {
//         throw new BadRequestException('Invalid salon_id');
//       }
//       targetSalonId = salon_id;
//     } else if (req.user.role === Roles.SALON) {
//       if (salon_id) {
//         throw new BadRequestException('salon_id is not allowed for SALON role');
//       }
//       targetSalonId = req.user._id;
//     } else {
//       throw new BadRequestException('Unauthorized role');
//     }

//     return this.salon_service.deleteSalon(targetSalonId);
//   }

//   @ApiBearerAuth()
//   @HttpCode(HttpStatus.OK)
//   @UseGuards(AuthGuard, RolesGuard)
//   @Role(Roles.SALON)
//   @Patch('/update_status')
//   @ApiOperation({ summary: 'Update the status of the authenticated user\'s salon or by superadmin' })
//   @ApiBody({
//     type: UpdateSalonStatusDto,
//     description: 'New status for the salon',
//   })
//   @ApiQuery({ name: 'salon_id', type: String, required: false, description: 'Salon ID (required for SUPERADMIN)' })
//   async update_salon_status(
//     @Body() updateSalonStatusDto: UpdateSalonStatusDto,
//     @Req() req: AuthPayloadRequest,
//     @Query('salon_id') salon_id?: string,
//   ) {
//     let targetSalonId: string;
//     if (req.user.role === Roles.SUPERADMIN) {
//       if (!salon_id) {
//         throw new BadRequestException('salon_id is required for SUPERADMIN');
//       }
//       if (!Types.ObjectId.isValid(salon_id)) {
//         throw new BadRequestException('Invalid salon_id');
//       }
//       targetSalonId = salon_id;
//     } else if (req.user.role === Roles.SALON) {
//       if (salon_id) {
//         throw new BadRequestException('salon_id is not allowed for SALON role');
//       }
//       targetSalonId = req.user._id;
//     } else {
//       throw new BadRequestException('Unauthorized role');
//     }

//     return this.salon_service.updateSalonStatus(updateSalonStatusDto.status, targetSalonId);
//   }
// }
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateSalonDto, UpdateSaloonDto, UpdateSalonStatusDto } from 'src/salon/dto/salon.dto';
import { SalonService } from './salon.service';
import { FileSizeValidationPipe, SingleImageSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';
import { AuthPayloadRequest } from 'src/product/interfaces/auth_payload_request.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { MultiRolesGuard } from 'src/auth/multi-roles.guard';
import { Role, Roles } from 'src/auth/roles.decorator';
import { Roles as RolesEnum } from 'src/auth/enums/roles.enum';

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
  @Role(RolesEnum.SALON) // Only SALON role for update_salon
  @Put('/update')
  @ApiOperation({ summary: 'Update a salon by authenticated user' })
  @ApiQuery({ name: 'salon_id', type: String, required: false, description: 'Salon ID (not allowed for SALON role)' })
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
    @Query('salon_id') salon_id?: string,
  ) {
    updateSalonDto.image1 = files.image1?.length ? files.image1[0] : undefined;
    updateSalonDto.image2 = files.image2?.length ? files.image2[0] : undefined;
    updateSalonDto.image3 = files.image3?.length ? files.image3[0] : undefined;
    updateSalonDto.image4 = files.image4?.length ? files.image4[0] : undefined;
    return this.salon_service.updateSalon(updateSalonDto, req.user, salon_id);
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
  @ApiOperation({ summary: 'Get a single salon by id' })
  @ApiQuery({ name: 'id', type: String, required: true })
  async get_a_salon_by_id(@Query() query: any) {
    return this.salon_service.getSalonById(query);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, MultiRolesGuard)
  @Roles([RolesEnum.SALON, RolesEnum.SUPERADMIN])
  @Delete('/delete')
  @ApiOperation({ summary: 'Delete a salon by authenticated user or superadmin' })
  @ApiQuery({ name: 'salon_id', type: String, required: false, description: 'Salon ID (required for SUPERADMIN)' })
  async delete_salon(
    @Req() req: AuthPayloadRequest,
    @Query('salon_id') salon_id?: string,
  ) {
    return this.salon_service.deleteSalon(req.user, salon_id);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, MultiRolesGuard)
  @Roles([RolesEnum.SALON, RolesEnum.SUPERADMIN])
  @Patch('/update_status')
  @ApiOperation({ summary: 'Update the status of the authenticated user\'s salon or by superadmin' })
  @ApiBody({
    type: UpdateSalonStatusDto,
    description: 'New status for the salon',
  })
  @ApiQuery({ name: 'salon_id', type: String, required: false, description: 'Salon ID (required for SUPERADMIN)' })
  async update_salon_status(
    @Body() updateSalonStatusDto: UpdateSalonStatusDto,
    @Req() req: AuthPayloadRequest,
    @Query('salon_id') salon_id?: string,
  ) {
    return this.salon_service.updateSalonStatus(updateSalonStatusDto.status, req.user, salon_id);
  }
}