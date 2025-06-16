import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListOrdersQueryDto {
  @ApiProperty({ example: 0, description: 'Order status ID (0 = all)' })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  orderStatusID!: number;

  @ApiProperty({
    example: '2025-06-01',
    description: 'Start date (yyyy-mm-dd)',
  })
  @IsDateString()
  fromDate!: string;

  @ApiProperty({ example: '2025-06-13', description: 'End date (yyyy-mm-dd)' })
  @IsDateString()
  toDate!: string;
}
