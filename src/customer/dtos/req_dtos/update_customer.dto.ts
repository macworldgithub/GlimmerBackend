import { PartialType } from "@nestjs/swagger";
import { CreateCustomerDto } from "./create_customer.dto";

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
