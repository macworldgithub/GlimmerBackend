import { IsInt, Min } from 'class-validator';

export class PaginatedDataDto {
  @Min(1)
  @IsInt()
  page_no: number;

  constructor(page_no: number) {
    this.page_no = page_no;
  }
}
