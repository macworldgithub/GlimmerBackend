export class UpdateSaleRecordDto {
  // New quantity (optional). If provided, soldUnits will be adjusted accordingly.
  quantity?: number;
  // New sale price (optional).
  price?: number;
  // New salon cut value (optional).
  salonCut?: number;
}
