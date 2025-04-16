// dto/update-rate.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRateDto {
  @ApiProperty({
    example: 56,
    description: 'New rate to update for the salon',
  })
  newRate!: number;
}
