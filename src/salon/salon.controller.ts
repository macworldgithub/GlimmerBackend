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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateSalonDto, UpdateSaloonDto } from 'src/salon/dto/salon.dto';
import { SalonService } from './salon.service';
import { SingleImageSizeValidationPipe } from 'src/commons/pipes/file_size_validation.pipe';
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
  @UseInterceptors(FileInterceptor('salon_image'))
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SALON)
  @Put('/update')
  async update_salon(
    @Body() updateSalonDto: UpdateSaloonDto,
    @Req()
    req: AuthPayloadRequest,
    @UploadedFile(new SingleImageSizeValidationPipe())
    salon_image?: Express.Multer.File,
  ) {
    salon_image ? (updateSalonDto.salon_image = salon_image) : null;

    return this.salon_service.updateSalon(updateSalonDto, req.user);
  }
}
