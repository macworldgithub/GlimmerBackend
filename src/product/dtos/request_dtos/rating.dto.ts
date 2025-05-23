import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class SubmitRatingDto {
  @ApiProperty({
    description: 'Rating value (1 to 5 stars)',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  constructor(rating: number) {
    this.rating = rating;
  }
}