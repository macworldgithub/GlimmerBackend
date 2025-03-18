// @ts-nocheck

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class CreateSalonServiceCategoriesDto {
  @ApiProperty({ description: 'Category of the salon service' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Services offered in this category',
    type: Object,
    example: { Hair: ['Cut', 'Coloring'], Nails: 'Manicure' },
  })
  @IsObject()
  @IsNotEmpty()
  services: Record<string, string[] | string>;
}

export class UpdateSalonServiceCategoriesDto {
  @ApiPropertyOptional({ description: 'Updated category of the salon service' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Updated services in this category',
    type: Object,
    example: { Hair: ['Styling', 'Keratin Treatment'], Nails: 'Pedicure' },
  })
  @IsObject()
  @IsOptional()
  services?: Record<string, string[] | string>;
}
