export class CreateSalonDto {
  salonName!: string;
  ownerName!: string;
  ownerContactEmail!: string;
  email!: string;
  password!: string;
  contactNumber!: string;
  address!: string;
  about!: string;
  salon_image?: Express.Multer.File;
}
