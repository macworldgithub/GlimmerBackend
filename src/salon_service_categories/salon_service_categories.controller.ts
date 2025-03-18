import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SalonServiceCategoriesService } from './salon_service_categories.service';
import {
  CreateSalonServiceCategoriesDto,
  UpdateSalonServiceCategoriesDto,
} from './dto/salon_service_categories.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/enums/roles.enum';
import { Role } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
@ApiTags('Salon Services Categories')
@Controller('salon-services-categories')
export class SalonServiceCategoriesController {
  constructor(
    private readonly salonServiceCategoriesService: SalonServiceCategoriesService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SUPERADMIN)
  @Post('create')
  @ApiOperation({ summary: 'Create a new salon service category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  create(@Body() createSalonServiceDto: CreateSalonServiceCategoriesDto) {
    return this.salonServiceCategoriesService.create(createSalonServiceDto);
  }

  @Get('getCategoryName')
  @ApiOperation({ summary: 'Get all salon service categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  findAll() {
    return this.salonServiceCategoriesService.findAll();
  }

  @Get('getCategryById/:id')
  @ApiOperation({ summary: 'Get a salon service category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string) {
    return this.salonServiceCategoriesService.findOne(id);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SUPERADMIN)
  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a salon service category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  update(
    @Param('id') id: string,
    @Body() updateSalonServiceDto: UpdateSalonServiceCategoriesDto,
  ) {
    return this.salonServiceCategoriesService.update(id, updateSalonServiceDto);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Role(Roles.SUPERADMIN)
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a salon service category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  remove(@Param('id') id: string) {
    return this.salonServiceCategoriesService.remove(id);
  }
}
