export class CreateSaleRecordDto {
    // The quantity sold in this sale record.
    quantity!: number;
    // The sale price at the time of the order.
    price!: number;
    // The commission (or cut) received by the salon for this sale.
    salonCut!: number;
  }