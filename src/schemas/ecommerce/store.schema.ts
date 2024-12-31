// @ts-nocheck


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VendorDocument = HydratedDocument<Store>;

@Schema()
export class Store {
    @Prop()
    store_name: string;

    @Prop()
    vendor_name: string;

    @Prop()
    description: string;

    @Prop()
    store_contact_email: string;

    @Prop()
    vendor_email: string;

    @Prop()
    country: string;

    @Prop()
    address: string;

    @Prop()
    store_image: string;

    @Prop([Date])
    created_at: Date;
}

export const StoreSchema = SchemaFactory.createForClass(Store);

