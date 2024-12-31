// @ts-nocheck


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StoreDocument = HydratedDocument<Store>;

@Schema()
export class Store {


    @Prop({ required: true })
    store_name: string;

    @Prop({ required: true })
    vendor_name: string;

    @Prop({ required: false, default: null })
    description?: string;

    @Prop({ required: true })
    store_contact_email: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: false, default: null })
    country?: string;

    @Prop({ required: false, default: null })
    address?: string;

    @Prop({ required: false, default: null })
    store_image?: string;

    @Prop({ type: Date, default: new Date() })
    created_at: Date;

    constructor(obj: Store) {
        this._id = obj._id.toString()
        this.store_name = obj.store_name
        this.vendor_name = obj.vendor_name
        this.description = obj.description
        this.store_contact_email = obj.store_contact_email
        this.email = obj.email
        this.country = obj.country
        this.address = obj.address
        this.store_image = obj.store_image
        this.created_at = obj.created_at
    }
}

export const StoreSchema = SchemaFactory.createForClass(Store);

export type StoreProjection = {
    [key in keyof Store]?: 0 | 1
};