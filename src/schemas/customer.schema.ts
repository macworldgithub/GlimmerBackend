// @ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { PartialType } from '@nestjs/swagger';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema()
export class Customer{
    // req-dto-decorators
    @IsString()
    // mongo-schema-decorators
    @Prop({ required: true })
    name: string;

    // req-dto-decorators
    @IsEmail()
    // mongo-schema-decorators
    @Prop({ required: true })
    email: string;


    // req-dto-decorators
    @Exclude()
    @IsString()
    // mongo-schema-decorators
    @Prop({ required: true })
    password : string;

    constructor(c: Customer){
        if (!c) return
        this._id = c._id?.toString()
        this.name= c.name
        this.email= c.email
        this.password= c.password
    }
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

export type CustomerProjection = {
    [key in keyof Customer]?: 0 | 1
};


